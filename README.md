# Radiology Triage Assistant — PS45 (SIH)

Uncertainty-aware, explainable pre-read worklist for brain MRI, built on
the SRIP E5 two-stage model (EfficientNetB3 + dual-LSTM + soft-attention,
90.69% accuracy). Reuses the trained architecture; the new work is the
translation layer (Grad-CAM → structured finding) and the uncertainty
layer (entropy + MC-dropout → triage bucket a radiologist can act on).

## Structure

```
backend/
  app/
    core/model_arch.py     # AttentionLayer + constants — ported verbatim from the notebook
    services/inference.py  # predict, Grad-CAM, uncertainty scoring
    services/report.py     # translation layer: model output -> structured report
    main.py                # FastAPI app: upload / worklist / detail / patch
  models/                  # put E5_TwoStage_best.keras here
  requirements.txt
frontend/
  src/App.jsx              # worklist dashboard + scan detail view
  src/App.css
```

## Day 1 setup (do this first)

1. **Export weights from Kaggle.** In your SRIP notebook, after E5 is
   trained, the model is already saved to `/kaggle/working/E5_TwoStage_best.keras`.
   Download that file from Kaggle's output panel and place it at
   `backend/models/E5_TwoStage_best.keras`.

2. **Confirm three things against the notebook before running inference** —
   these are marked `TODO` / `confirm` in `model_arch.py` and `inference.py`:
   - `IMG_SIZE` — check the `IMG_SIZE` constant in Section 1/2 of the notebook.
   - `CLASS_NAMES` order — must match `train_data.class_indices` exactly
     (wrong order = confidently wrong predictions, silent failure).
   - `GRAD_CAM_LAYER` — run `model.summary()` (and the nested EfficientNetB3
     sub-model's `.summary()`) and find the last conv layer name, commonly
     `top_conv` for EfficientNetB3, but confirm.

3. **Backend:**
   ```
   cd backend
   pip install -r requirements.txt
   export MODEL_PATH=models/E5_TwoStage_best.keras
   export ANTHROPIC_API_KEY=your_key   # optional — report works without it
   uvicorn app.main:app --reload --port 8000
   ```
   Check `GET /api/health` — `model_loaded: true` means you're good.

4. **Frontend:**
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Open the printed localhost URL. Upload an MRI image, it'll run
   inference, show up in the worklist sorted by triage priority
   (low_confidence first), click in to see Grad-CAM overlay + editable
   report.

## What's already wired end-to-end

- Upload → inference (class + confidence) → Grad-CAM overlay → uncertainty
  bucket (entropy + MC-dropout) → structured report → worklist sorted by
  priority → editable/approvable report in the UI.

## What's left for the 6 days (see role split from earlier planning)

- Verify IMG_SIZE / CLASS_NAMES / GRAD_CAM_LAYER against the real trained model.
- Tune the uncertainty bucket thresholds in `inference.py` (`compute_uncertainty`)
  once you have real predictions on a validation set — the initial thresholds
  are a reasonable first guess, not calibrated.
- Business-value screen: a simple "time saved" panel showing estimated
  turnaround-time reduction — this directly answers the "too broad / needs
  business model" feedback from last SIH.
- Deploy: reuse your Railway/Render muscle memory from InvestIQ/AlphaLens.
- Pitch deck + SIH submission form text.
