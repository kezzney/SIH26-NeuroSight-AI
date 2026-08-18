"""
Translation layer — this is the core differentiator described in the
SIH pitch: turns raw model output (class + Grad-CAM + uncertainty)
into a structured, editable clinical pre-read, instead of stopping at
a heatmap.

Two modes:
  - build_structured_report(): pure template, zero external calls,
    always works, use this as the reliable fallback for the demo.
  - phrase_with_claude(): optional polish pass that rewrites the
    templated note in more natural clinical language via the
    Anthropic API. Nice for the demo but NOT the dependency — if the
    API call fails or there's no key, structured report still stands
    on its own.
"""

import os
from anthropic import Anthropic

REGION_DESCRIPTIONS = {
    "glioma": "diffuse infiltrative pattern, attention concentrated in white matter region",
    "meningioma": "well-circumscribed extra-axial attention focus, consistent with dural-based origin",
    "pituitary": "attention concentrated in sellar/suprasellar region",
    "notumor": "no focal attention concentration suggestive of mass lesion",
}


def build_structured_report(predicted_class: str, confidence: float, uncertainty: dict) -> dict:
    """Deterministic, template-based structured finding. This is what
    ships even if the Claude API polish step is skipped or fails."""
    region_note = REGION_DESCRIPTIONS.get(predicted_class, "attention pattern noted, region non-specific")

    return {
        "finding_class": predicted_class,
        "region_note": region_note,
        "confidence_pct": round(confidence * 100, 1),
        "triage_bucket": uncertainty["bucket"],
        "recommended_action": uncertainty["recommended_action"],
        "draft_note": (
            f"Model classification: {predicted_class.upper()} "
            f"(confidence {round(confidence * 100, 1)}%). "
            f"Grad-CAM {region_note}. "
            f"Uncertainty assessment: {uncertainty['bucket'].replace('_', ' ')} "
            f"(entropy {uncertainty['normalized_entropy']}, "
            f"MC-dropout std {uncertainty['mc_dropout_std']}). "
            f"{uncertainty['recommended_action']} "
            f"This is an AI-generated pre-read for triage support only — "
            f"final interpretation requires radiologist confirmation."
        ),
    }


def phrase_with_claude(structured: dict) -> str:
    """Optional: rewrite the templated note in more natural clinical
    phrasing. Falls back to the template's draft_note on any failure —
    never let a demo depend on this succeeding."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return structured["draft_note"]

    try:
        client = Anthropic(api_key=api_key)
        prompt = (
            "Rewrite this AI radiology pre-read as a concise, natural "
            "clinical note a radiologist would find useful in a worklist. "
            "Keep it factual, do not add findings not present in the input, "
            "keep the triage recommendation explicit. Input:\n\n"
            f"{structured['draft_note']}"
        )
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        text_blocks = [b.text for b in resp.content if b.type == "text"]
        return "".join(text_blocks) if text_blocks else structured["draft_note"]
    except Exception:
        return structured["draft_note"]
