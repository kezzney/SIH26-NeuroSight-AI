"""
FastAPI backend for the radiology triage assistant.

Endpoints:
  POST /api/scans/upload   -> run inference, add to worklist, return result
  GET  /api/scans          -> list worklist, sorted by triage priority
  GET  /api/scans/{id}     -> full detail for one scan (report + heatmap)
  PATCH /api/scans/{id}    -> radiologist edits/approves the report

Storage: in-memory dict for the hackathon demo — swap for a real DB
(e.g. SQLite via SQLModel) if time allows, but this is NOT worth
spending build time on early. Get the demo flow working first.
"""

import uuid
import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException,Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services import inference, report

app = FastAPI(title="Radiology Triage Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before any real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

# in-memory worklist store: {scan_id: scan_dict}
WORKLIST: dict[str, dict] = {}

TRIAGE_PRIORITY = {"low_confidence": 0, "moderate_confidence": 1, "high_confidence": 2}


class ScanUpdate(BaseModel):
    radiologist_note: Optional[str] = None
    status: Optional[str] = None  # "pending" | "reviewed" | "approved"


@app.post("/api/scans/upload")
async def upload_scan(file: UploadFile = File(...), patient_ref: str =Form( "Unlabeled")):
    image_bytes = await file.read()

    try:
        result = inference.predict(image_bytes)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    structured = report.build_structured_report(
        result["predicted_class"], result["confidence"], result["uncertainty"]
    )
    phrased_note = report.phrase_with_claude(structured)

    scan_id = str(uuid.uuid4())
    scan = {
        "id": scan_id,
        "patient_ref": patient_ref,
        "uploaded_at": datetime.datetime.utcnow().isoformat(),
        "status": "pending",
        "predicted_class": result["predicted_class"],
        "confidence": result["confidence"],
        "class_probabilities": result["class_probabilities"],
        "triage_bucket": result["uncertainty"]["bucket"],
        "uncertainty": result["uncertainty"],
        "gradcam_overlay_base64": result["gradcam_overlay_base64"],
        "structured_report": structured,
        "report_note": phrased_note,
        "radiologist_note": None,
    }
    WORKLIST[scan_id] = scan
    return scan


@app.get("/api/scans")
def list_scans():
    scans = list(WORKLIST.values())
    scans.sort(key=lambda s: (TRIAGE_PRIORITY.get(s["triage_bucket"], 1), s["uploaded_at"]))
    # lightweight list view — omit the big base64 image payload
    return [
        {k: v for k, v in s.items() if k != "gradcam_overlay_base64"}
        for s in scans
    ]


@app.get("/api/scans/{scan_id}")
def get_scan(scan_id: str):
    scan = WORKLIST.get(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@app.patch("/api/scans/{scan_id}")
def update_scan(scan_id: str, update: ScanUpdate):
    scan = WORKLIST.get(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if update.radiologist_note is not None:
        scan["radiologist_note"] = update.radiologist_note
    if update.status is not None:
        scan["status"] = update.status
    return scan


@app.get("/api/health")
def health():
    model_loaded = True
    try:
        inference.get_model()
    except Exception:
        model_loaded = False
    return {"status": "ok", "model_loaded": model_loaded}
