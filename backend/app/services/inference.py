"""
Inference service for the radiology triage assistant.

Wraps the trained E5 two-stage model (EfficientNetB3 + dual-LSTM +
soft-attention) and adds the two layers that differentiate this from
a plain classifier demo:

  1. Grad-CAM localization  -> WHERE the model is looking
  2. Uncertainty scoring    -> HOW MUCH to trust that prediction,
                                expressed as an actionable triage
                                bucket instead of a raw confidence %

TODO (once you export weights from Kaggle):
  - Set MODEL_PATH to the .keras file location
  - Confirm IMG_SIZE / CLASS_NAMES in model_arch.py match your notebook
  - Confirm the name of the last EfficientNetB3 conv layer for Grad-CAM
    (print model.summary() and search for it — commonly 'top_conv')
"""

import os
import io
import base64
from typing import Tuple
import urllib.request

import numpy as np
import tensorflow as tf
from PIL import Image
import cv2

from app.core.model_arch import CUSTOM_OBJECTS, IMG_SIZE, CLASS_NAMES


def _get_model_path() -> str:
    # 1. Use MODEL_PATH only if explicitly set AND the file exists
    env_path = os.environ.get("MODEL_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    # 2. Check local model
    local_candidates = [
        "models/E5_fixed_final.keras",
        "backend/models/E5_fixed_final.keras",
    ]

    for path in local_candidates:
        if os.path.exists(path):
            return path

    # 3. Download from Hugging Face
    model_url = os.environ.get(
        "MODEL_URL",
        "https://huggingface.co/Kezzney/neurosight-model/resolve/main/E5_fixed_final.keras"
    )

    download_path = "/tmp/E5_fixed_final.keras"

    if not os.path.exists(download_path):
        print(f"Downloading model from: {model_url}")

        import urllib.request

        urllib.request.urlretrieve(
            model_url,
            download_path
        )

        print(f"Model downloaded to: {download_path}")

    return download_path


MODEL_PATH = _get_model_path()
GRAD_CAM_LAYER = os.environ.get("GRAD_CAM_LAYER", "top_conv")  # last EfficientNetB3 conv layer — verify name

_model = None


def get_model():
    """Lazy-load the model once per process."""
    global _model, MODEL_PATH
    if _model is None:
        path = _get_model_path()
        MODEL_PATH = path
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Model not found at {path}. Export E5_fixed_final.keras or E5_best_final.keras "
                "from Kaggle and place it in backend/models/, or set MODEL_PATH."
            )
        _model = tf.keras.models.load_model(path, custom_objects=CUSTOM_OBJECTS)
    return _model


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Match the EfficientNet preprocessing used in training — do not
    swap in generic 0-1 normalization, the notebook flags this as the
    #1 past mistake."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)


def predict(image_bytes: bytes) -> dict:
    model = get_model()
    x = preprocess_image(image_bytes)
    probs = model.predict(x, verbose=0)[0]

    top_idx = int(np.argmax(probs))
    top_class = CLASS_NAMES[top_idx]
    top_conf = float(probs[top_idx])

    uncertainty = compute_uncertainty(model, x, probs)

    # Grad-CAM is a visual nice-to-have — never let it break the core
    # prediction. If the nested EfficientNetB3 graph isn't cleanly
    # reachable (common with wrapped sub-models), log it and continue
    # without the overlay rather than 500ing the whole upload.
    try:
        heatmap_b64 = grad_cam_overlay(model, x, image_bytes, top_idx)
    except Exception as e:
        print(f"[grad_cam] skipped due to error: {e}")
        heatmap_b64 = None

    return {
        "predicted_class": top_class,
        "confidence": round(top_conf, 4),
        "class_probabilities": {c: round(float(p), 4) for c, p in zip(CLASS_NAMES, probs)},
        "uncertainty": uncertainty,
        "gradcam_overlay_base64": heatmap_b64,
    }


def compute_uncertainty(model, x: np.ndarray, probs: np.ndarray, mc_passes: int = 15) -> dict:
    """
    Two signals combined into one actionable triage bucket:

    1. Predictive entropy of the softmax — how "spread out" the
       prediction is across classes right now.
    2. MC-Dropout variance — run several stochastic forward passes
       (dropout layers active) and measure how much the prediction
       wobbles. High wobble = model is not confident even though a
       single forward pass might show a high softmax number.

    This is what turns a naked confidence % into something a
    radiologist can actually act on.
    """
    eps = 1e-9
    entropy = float(-np.sum(probs * np.log(probs + eps)))
    max_entropy = float(np.log(len(probs)))
    norm_entropy = entropy / max_entropy  # 0 = certain, 1 = maximally uncertain

    # MC-Dropout: force training=True so dropout stays active at inference
    mc_preds = np.stack([
        model(x, training=True).numpy()[0] for _ in range(mc_passes)
    ])
    mc_mean = mc_preds.mean(axis=0)
    mc_std = float(mc_preds.std(axis=0).max())  # max std across classes

    # Combine into a single triage bucket. Thresholds are a first pass —
    # tune against a validation set once you have real predictions.
    if norm_entropy < 0.22 and mc_std < 0.05:
        bucket = "high_confidence"
        action = "Standard queue — model prediction consistent across passes."
    elif norm_entropy < 0.5 and mc_std < 0.12:
        bucket = "moderate_confidence"
        action = "Recommend standard radiologist review."
    else:
        bucket = "low_confidence"
        action = "Flag for priority radiologist review — model uncertain, do not rely on class label alone."

    return {
        "bucket": bucket,
        "recommended_action": action,
        "normalized_entropy": round(norm_entropy, 4),
        "mc_dropout_std": round(mc_std, 4),
    }


def grad_cam_overlay(model, x: np.ndarray, original_bytes: bytes, class_idx: int) -> str:
    """Generate Grad-CAM heatmap over the target conv layer and overlay
    it on the original image. Returns a base64-encoded PNG."""
    try:
        target_layer = model.get_layer(GRAD_CAM_LAYER)
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[target_layer.output, model.output]
        )
        with tf.GradientTape() as tape:
            conv_output, predictions = grad_model(x)
            loss = predictions[:, class_idx]
    except Exception:
        # Layer not directly in top model — search inside nested sub-models (e.g. EfficientNetB3)
        sub_model, target_layer, sub_idx = _find_nested_conv_layer(model)
        sub_grad_model = tf.keras.models.Model(
            inputs=sub_model.inputs,
            outputs=[target_layer.output, sub_model.output]
        )
        with tf.GradientTape() as tape:
            conv_output, sub_out = sub_grad_model(x)
            h = sub_out
            for layer in model.layers[sub_idx + 1:]:
                h = layer(h)
            predictions = h
            loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_output = conv_output[0]
    heatmap = conv_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-9)
    heatmap = heatmap.numpy()

    original = Image.open(io.BytesIO(original_bytes)).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
    original_arr = np.array(original)

    heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(original_arr, 0.6, heatmap_color, 0.4, 0)
    overlay_img = Image.fromarray(overlay)

    buf = io.BytesIO()
    overlay_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _find_nested_conv_layer(model):
    """EfficientNetB3 is often nested as a sub-model layer. Search inside
    it for the target conv layer name if a top-level lookup fails."""
    for idx, layer in enumerate(model.layers):
        if hasattr(layer, "layers"):
            for sub in layer.layers:
                if sub.name == GRAD_CAM_LAYER:
                    return layer, sub, idx
    raise ValueError(
        f"Could not find layer '{GRAD_CAM_LAYER}'. Run model.summary() "
        "(and base_model.summary() for the nested EfficientNetB3) to find "
        "the correct last-conv-layer name and update GRAD_CAM_LAYER."
    )
