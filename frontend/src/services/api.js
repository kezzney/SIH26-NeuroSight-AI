/**
 * NEUROSIGHT AI - API Client Service
 * Centralized communication layer interacting with the FastAPI backend.
 * Respects protected API contracts.
 */

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  'http://localhost:8000'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errDetail = 'Request failed';
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }
      throw new ApiError(errDetail || `HTTP Error ${res.status}`, res.status);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err.message === 'Failed to fetch'
        ? 'Backend service is unreachable. Please verify the FastAPI server is running on port 8000.'
        : err.message,
      0
    );
  }
}

export const api = {
  getBaseUrl() {
    return API_BASE;
  },

  /**
   * Health check endpoint
   * GET /api/health -> { status: "ok", model_loaded: boolean }
   */
  async checkHealth() {
    return request('/api/health');
  },

  /**
   * List worklist scans sorted by triage priority
   * GET /api/scans -> Array<ScanSummary>
   */
  async listScans() {
    return request('/api/scans');
  },

  /**
   * Fetch single scan detail with Grad-CAM base64 overlay
   * GET /api/scans/{scanId} -> Scan
   */
  async getScan(scanId) {
    if (!scanId) throw new Error('scanId is required');
    return request(`/api/scans/${encodeURIComponent(scanId)}`);
  },

  /**
   * Upload MRI scan for real AI inference & uncertainty evaluation
   * POST /api/scans/upload?patient_ref=...
   */
  async uploadScan(file, patientRef = 'Unlabeled') {
  if (!file) throw new Error('File is required for upload');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('patient_ref', patientRef.trim() || 'Unlabeled');

  return request('/api/scans/upload', {
    method: 'POST',
    body: formData,
  });
},

  /**
   * Update scan report and workflow status
   * PATCH /api/scans/{scanId}
   * Body: { radiologist_note?: string, status?: string }
   */
  async updateScan(scanId, { radiologist_note, status }) {
    if (!scanId) throw new Error('scanId is required');
    const body = {};
    if (radiologist_note !== undefined) body.radiologist_note = radiologist_note;
    if (status !== undefined) body.status = status;

    return request(`/api/scans/${encodeURIComponent(scanId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },
};
