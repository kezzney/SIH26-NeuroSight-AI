"""
Inference service for the NeuroSight radiology triage assistant.

Model:
    E5_fixed_final.keras
    EfficientNetB3 + dual-LSTM + soft-attention

Features:
    1. Brain MRI classification
    2. Grad-CAM visualization
    3. Uncertainty estimation
    4. Radiologist-oriented triage recommendation

The model is downloaded from Hugging Face when the backend starts
or when the first prediction is requested.
"""

import os
import io
import base64
import urllib.request

import numpy as np
import tensorflow as tf
from PIL import Image
import cv2

from app.core.model_arch import CUSTOM_OBJECTS, IMG_SIZE, CLASS_NAMES


# -------------------------------------------------------------------
# MODEL CONFIGURATION
# -------------------------------------------------------------------

MODEL_URL = os.environ.get(
    "MODEL_URL",
    "https://huggingface.co/Kezzney/neurosight-model/resolve/main/E5_fixed_final.keras",
)

DOWNLOAD_PATH = "/tmp/E5_fixed_final.keras"

GRAD_CAM_LAYER = os.environ.get(
    "GRAD_CAM_LAYER",
    "top_conv",
)

MODEL_PATH = None
_model = None


# -------------------------------------------------------------------
# MODEL DOWNLOAD / PATH
# -------------------------------------------------------------------

def _get_model_path() -> str:
    """
    Get the model path.

    Priority:
        1. Existing model in /tmp
        2. Download model from Hugging Face
    """

    print(f"MODEL_URL = {MODEL_URL}")
    print(f"MODEL_PATH environment variable = {os.environ.get('MODEL_PATH')}")

    # Reuse already downloaded model during the current container lifetime
    if os.path.exists(DOWNLOAD_PATH):
        file_size = os.path.getsize(DOWNLOAD_PATH)

        if file_size > 1_000_000:
            print(
                f"Using downloaded model: {DOWNLOAD_PATH} "
                f"({file_size / (1024 * 1024):.2f} MB)"
            )
            return DOWNLOAD_PATH

        # Remove corrupted/incomplete file
        print("Existing model file is too small. Re-downloading.")
        try:
            os.remove(DOWNLOAD_PATH)
        except OSError:
            pass

    print(f"Downloading model from: {MODEL_URL}")

    try:
        urllib.request.urlretrieve(
            MODEL_URL,
            DOWNLOAD_PATH,
        )

        if not os.path.exists(DOWNLOAD_PATH):
            raise FileNotFoundError(
                "Model download completed but the file was not created."
            )

        file_size = os.path.getsize(DOWNLOAD_PATH)

        print(
            f"Model downloaded successfully: "
            f"{file_size / (1024 * 1024):.2f} MB"
        )

        # Your model is ~87 MB.
        # Reject obviously invalid downloads.
        if file_size < 1_000_000:
            raise ValueError(
                f"Downloaded model is too small: {file_size} bytes"
            )

        return DOWNLOAD_PATH

    except Exception as e:
        raise RuntimeError(
            f"Failed to download model from Hugging Face: {e}"
        ) from e


# -------------------------------------------------------------------
# LOAD MODEL
# -------------------------------------------------------------------

def get_model():
    """
    Lazy-load the TensorFlow model once per Railway container.
    """

    global _model, MODEL_PATH

    if _model is None:

        path = _get_model_path()

        MODEL_PATH = path

        print(f"Loading Keras model from: {path}")

        try:
            _model = tf.keras.models.load_model(
                path,
                custom_objects=CUSTOM_OBJECTS,
            )

            print("Keras model loaded successfully.")

        except Exception as e:
            print(f"ERROR loading Keras model: {e}")

            # Remove potentially corrupted downloaded file
            if path == DOWNLOAD_PATH:
                try:
                    os.remove(path)
                except OSError:
                    pass

            raise RuntimeError(
                f"Could not load Keras model from {path}: {e}"
            ) from e

    return _model


# -------------------------------------------------------------------
# IMAGE PREPROCESSING
# -------------------------------------------------------------------

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess uploaded MRI image using the same EfficientNet
    preprocessing used during training.
    """

    img = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    img = img.resize(
        (IMG_SIZE, IMG_SIZE)
    )

    arr = np.array(
        img,
        dtype=np.float32,
    )

    arr = tf.keras.applications.efficientnet.preprocess_input(arr)

    return np.expand_dims(
        arr,
        axis=0,
    )


# -------------------------------------------------------------------
# PREDICTION
# -------------------------------------------------------------------

def predict(image_bytes: bytes) -> dict:

    model = get_model()

    x = preprocess_image(image_bytes)

    probs = model.predict(
        x,
        verbose=0,
    )[0]

    top_idx = int(
        np.argmax(probs)
    )

    top_class = CLASS_NAMES[top_idx]

    top_conf = float(
        probs[top_idx]
    )

    uncertainty = compute_uncertainty(
        model,
        x,
        probs,
    )

    # Grad-CAM should never prevent the main prediction.
    try:

        heatmap_b64 = grad_cam_overlay(
            model,
            x,
            image_bytes,
            top_idx,
        )

    except Exception as e:

        print(
            f"[grad_cam] skipped due to error: {e}"
        )

        heatmap_b64 = None

    return {
        "predicted_class": top_class,
        "confidence": round(top_conf, 4),

        "class_probabilities": {
            c: round(float(p), 4)
            for c, p in zip(
                CLASS_NAMES,
                probs,
            )
        },

        "uncertainty": uncertainty,

        "gradcam_overlay_base64": heatmap_b64,
    }


# -------------------------------------------------------------------
# UNCERTAINTY ESTIMATION
# -------------------------------------------------------------------

def compute_uncertainty(
    model,
    x: np.ndarray,
    probs: np.ndarray,
    mc_passes: int = 15,
) -> dict:

    eps = 1e-9

    # Predictive entropy
    entropy = float(
        -np.sum(
            probs * np.log(probs + eps)
        )
    )

    max_entropy = float(
        np.log(len(probs))
    )

    norm_entropy = (
        entropy / max_entropy
    )

    # MC-Dropout
    mc_preds = np.stack(
        [
            model(
                x,
                training=True,
            ).numpy()[0]
            for _ in range(mc_passes)
        ]
    )

    mc_std = float(
        mc_preds.std(
            axis=0
        ).max()
    )

    # Triage bucket
    if (
        norm_entropy < 0.22
        and mc_std < 0.05
    ):

        bucket = "high_confidence"

        action = (
            "Standard queue — model prediction "
            "consistent across passes."
        )

    elif (
        norm_entropy < 0.5
        and mc_std < 0.12
    ):

        bucket = "moderate_confidence"

        action = (
            "Recommend standard radiologist review."
        )

    else:

        bucket = "low_confidence"

        action = (
            "Flag for priority radiologist review — "
            "model uncertain, do not rely on class "
            "label alone."
        )

    return {
        "bucket": bucket,

        "recommended_action": action,

        "normalized_entropy": round(
            norm_entropy,
            4,
        ),

        "mc_dropout_std": round(
            mc_std,
            4,
        ),
    }


# -------------------------------------------------------------------
# GRAD-CAM
# -------------------------------------------------------------------

def grad_cam_overlay(
    model,
    x: np.ndarray,
    original_bytes: bytes,
    class_idx: int,
) -> str:

    try:

        target_layer = model.get_layer(
            GRAD_CAM_LAYER
        )

        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[
                target_layer.output,
                model.output,
            ],
        )

        with tf.GradientTape() as tape:

            conv_output, predictions = grad_model(x)

            loss = predictions[
                :,
                class_idx,
            ]

    except Exception:

        # Search nested EfficientNet model
        sub_model, target_layer, sub_idx = (
            _find_nested_conv_layer(model)
        )

        sub_grad_model = tf.keras.models.Model(
            inputs=sub_model.inputs,
            outputs=[
                target_layer.output,
                sub_model.output,
            ],
        )

        with tf.GradientTape() as tape:

            conv_output, sub_out = (
                sub_grad_model(x)
            )

            h = sub_out

            for layer in model.layers[
                sub_idx + 1:
            ]:

                h = layer(h)

            predictions = h

            loss = predictions[
                :,
                class_idx,
            ]

    grads = tape.gradient(
        loss,
        conv_output,
    )

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(0, 1, 2),
    )

    conv_output = conv_output[0]

    heatmap = (
        conv_output
        @ pooled_grads[..., tf.newaxis]
    )

    heatmap = tf.squeeze(
        heatmap
    )

    heatmap = tf.maximum(
        heatmap,
        0,
    )

    heatmap = (
        heatmap
        / (
            tf.math.reduce_max(
                heatmap
            )
            + 1e-9
        )
    )

    heatmap = heatmap.numpy()

    # Original image
    original = (
        Image.open(
            io.BytesIO(
                original_bytes
            )
        )
        .convert("RGB")
        .resize(
            (IMG_SIZE, IMG_SIZE)
        )
    )

    original_arr = np.array(
        original
    )

    # Resize heatmap
    heatmap = cv2.resize(
        heatmap,
        (IMG_SIZE, IMG_SIZE),
    )

    heatmap = np.uint8(
        255 * heatmap
    )

    heatmap_color = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET,
    )

    heatmap_color = cv2.cvtColor(
        heatmap_color,
        cv2.COLOR_BGR2RGB,
    )

    # Overlay
    overlay = cv2.addWeighted(
        original_arr,
        0.6,
        heatmap_color,
        0.4,
        0,
    )

    overlay_img = Image.fromarray(
        overlay
    )

    buf = io.BytesIO()

    overlay_img.save(
        buf,
        format="PNG",
    )

    return base64.b64encode(
        buf.getvalue()
    ).decode("utf-8")


# -------------------------------------------------------------------
# FIND NESTED EFFICIENTNET CONV LAYER
# -------------------------------------------------------------------

def _find_nested_conv_layer(model):

    for idx, layer in enumerate(
        model.layers
    ):

        if hasattr(
            layer,
            "layers",
        ):

            for sub in layer.layers:

                if sub.name == GRAD_CAM_LAYER:

                    return (
                        layer,
                        sub,
                        idx,
                    )

    raise ValueError(
        f"Could not find layer "
        f"'{GRAD_CAM_LAYER}'. "
        f"Check the EfficientNetB3 model "
        f"summary and update GRAD_CAM_LAYER."
    )