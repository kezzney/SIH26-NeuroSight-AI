import React from 'react';
import { IconPrinter, IconX } from '../common/Icons';
import { safePercent, safeString, safeUpper } from '../../utils/format';

export function PrintReport({ scan, onClose }) {
  if (!scan) return null;

  function handlePrint() {
    window.print();
  }

  const structured = scan.structured_report || {};
  const probs = scan.class_probabilities || {};

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Controls (Hidden in print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            Clinical Report Preview (Print / PDF Export)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-xs)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <IconPrinter size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                color: '#94a3b8',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div
          id="printable-report"
          style={{
            padding: '36px 40px',
            overflowY: 'auto',
            fontFamily: 'var(--font-family)',
            fontSize: '13px',
            lineHeight: 1.5,
          }}
        >
          {/* Institutional Header */}
          <div
            style={{
              borderBottom: '2px solid #0f172a',
              paddingBottom: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>
                NEUROSIGHT AI
              </h1>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                AI-ASSISTED BRAIN MRI ANALYSIS & TRIAGE REPORT
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
              <div>SIH 2026 Medical Workstation</div>
              <div>Report Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Case Metadata Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', width: '25%', color: '#64748b', fontWeight: 600 }}>CASE REFERENCE:</td>
                <td style={{ padding: '6px 0', width: '25%', fontWeight: 700 }}>{safeString(scan.patient_ref, 'Unlabeled')}</td>
                <td style={{ padding: '6px 0', width: '25%', color: '#64748b', fontWeight: 600 }}>SCAN IDENTIFIER:</td>
                <td style={{ padding: '6px 0', width: '25%', fontFamily: 'var(--font-mono)' }}>{safeString(scan.id)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 600 }}>ANALYSIS TIMESTAMP:</td>
                <td style={{ padding: '6px 0' }}>{scan.uploaded_at ? new Date(scan.uploaded_at).toLocaleString() : '—'}</td>
                <td style={{ padding: '6px 0', color: '#64748b', fontWeight: 600 }}>REVIEW STATUS:</td>
                <td style={{ padding: '6px 0', fontWeight: 700, textTransform: 'uppercase' }}>{safeUpper(scan.status || 'pending')}</td>
              </tr>
            </tbody>
          </table>

          {/* Core Findings & Image Snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px', marginBottom: '20px' }}>
            <div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  AI PRELIMINARY CLASSIFICATION
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', marginTop: '2px', textTransform: 'uppercase' }}>
                  {safeUpper(scan.predicted_class)}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  Model Confidence: <strong>{safePercent(scan.confidence)}</strong> · Triage Bucket:{' '}
                  <strong>{safeUpper((scan.triage_bucket || '').replace('_', ' '))}</strong>
                </div>
              </div>

              {/* Probabilities */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Posterior Probabilities:
                </div>
                {Object.entries(probs).map(([cls, p]) => (
                  <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                    <span style={{ textTransform: 'capitalize' }}>{cls}:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{safePercent(p)}</span>
                  </div>
                ))}
              </div>

              {/* Uncertainty Profile */}
              <div style={{ fontSize: '11px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                <div>Normalized Entropy: <strong>{scan.uncertainty?.normalized_entropy != null ? String(scan.uncertainty.normalized_entropy) : 'N/A'}</strong></div>
                <div>MC-Dropout Std Dev: <strong>{scan.uncertainty?.mc_dropout_std != null ? String(scan.uncertainty.mc_dropout_std) : 'N/A'}</strong></div>
                <div>Triage Action: <em>{scan.uncertainty?.recommended_action || 'N/A'}</em></div>
              </div>
            </div>

            {/* Grad-CAM Thumbnail */}
            {scan.gradcam_overlay_base64 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  GRAD-CAM ATTENTION
                </div>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    backgroundColor: '#000000',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={`data:image/png;base64,${scan.gradcam_overlay_base64}`}
                    alt="Grad-CAM"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                  Target Conv: top_conv
                </div>
              </div>
            )}
          </div>

          {/* Structured Note & Radiologist Impression */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              AI-ASSISTED PRE-READ NOTE
            </div>
            <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.4, marginBottom: '14px' }}>
              {scan.report_note || structured.draft_note || 'No preliminary note generated.'}
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              RADIOLOGIST CLINICAL IMPRESSION & SIGN-OFF
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#0f172a',
                lineHeight: 1.5,
                backgroundColor: '#f8fafc',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-sm)',
                minHeight: '60px',
              }}
            >
              {scan.radiologist_note || 'Case pending formal radiologist sign-off.'}
            </div>
          </div>

          {/* Signature Line & Governance Disclaimer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px' }}>
            <div style={{ maxWidth: '420px', fontSize: '10px', color: '#64748b', lineHeight: 1.3 }}>
              <strong>Research Prototype Governance:</strong> AI output is intended for decision support and does not
              constitute a medical diagnosis. Final interpretation remains with a qualified radiologist.
            </div>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: 600 }}>Attending Radiologist Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
