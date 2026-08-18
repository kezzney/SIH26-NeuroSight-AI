import React from 'react';
import { IconActivity, IconAlertTriangle, IconCheckCircle, IconClock, IconFileText, IconShield, IconChevronRight } from '../common/Icons';
import { TriageBadge, ClassBadge } from '../common/Badge';

export function MetricsSummary({ scans, onSelectScan, onNewScanClick }) {
  const total = scans.length;
  const pending = scans.filter((s) => (s.status || 'pending').toLowerCase() === 'pending').length;
  const priority = scans.filter((s) => s.triage_bucket === 'low_confidence').length;
  const reviewed = scans.filter((s) => ['reviewed', 'approved'].includes((s.status || '').toLowerCase())).length;

  const classCounts = scans.reduce((acc, s) => {
    const cls = s.predicted_class || 'unknown';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const priorityCases = scans.filter((s) => s.triage_bucket === 'low_confidence').slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Radiology Command Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
            Real-time uncertainty-aware worklist prioritization and brain MRI explainability engine.
          </p>
        </div>
        <button
          onClick={onNewScanClick}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: 'var(--font-base)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <IconActivity size={16} />
          <span>Upload New MRI Scan</span>
        </button>
      </div>

      {/* Real Data KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Scans */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            <span>TOTAL ANALYZED SCANS</span>
            <IconFileText size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {total}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Session in-memory worklist
          </div>
        </div>

        {/* Priority Review */}
        <div
          style={{
            backgroundColor: priority > 0 ? 'var(--priority-high-bg)' : 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${priority > 0 ? 'var(--priority-high-border)' : 'var(--border-primary)'}`,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: priority > 0 ? 'var(--priority-high-text)' : 'var(--text-muted)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
            <span>PRIORITY REVIEW QUEUE</span>
            <IconAlertTriangle size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: priority > 0 ? 'var(--priority-high-text)' : 'var(--text-primary)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {priority}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: priority > 0 ? 'var(--priority-high-text)' : 'var(--text-muted)', marginTop: '4px' }}>
            High entropy or MC-dropout wobble
          </div>
        </div>

        {/* Pending Review */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            <span>PENDING RADIOLOGIST SIGN-OFF</span>
            <IconClock size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {pending}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting clinical impression note
          </div>
        </div>

        {/* Reviewed Cases */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            <span>REVIEWED & APPROVED</span>
            <IconCheckCircle size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#047857', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {reviewed}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified by radiologist
          </div>
        </div>

        {/* Verified Model Evaluation */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #1e293b',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 'var(--font-sm)' }}>
            <span>E5 MODEL BENCHMARK</span>
            <IconShield size={16} style={{ color: '#60a5fa' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#38bdf8', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            88.75%
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: '#94a3b8', marginTop: '4px' }}>
            On 1,600 held-out test scans (SRIP 2026)
          </div>
        </div>
      </div>

      {/* Two-Column Clinical Distribution & Priority Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Priority Attention Scans */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Priority Triage Queue ({priorityCases.length})
            </h3>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              Sorted by uncertainty risk
            </span>
          </div>

          {priorityCases.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              {total === 0 ? 'No MRI scans loaded yet. Upload a scan to populate the worklist.' : 'No priority uncertainty flags in current queue.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {priorityCases.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectScan(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--priority-high-border)',
                    backgroundColor: 'var(--priority-high-bg)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: 'var(--font-base)', color: 'var(--text-primary)' }}>
                        {s.patient_ref || 'Unlabeled'}
                      </strong>
                      <ClassBadge findingClass={s.predicted_class} />
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      Confidence: {(s.confidence * 100).toFixed(1)}% · Entropy: {s.uncertainty?.normalized_entropy ?? 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TriageBadge bucket={s.triage_bucket} size="small" />
                    <IconChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Finding Class Distribution */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Worklist Classification Distribution
            </h3>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              4 Multi-class categories
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'glioma', label: 'Glioma', desc: 'Infiltrative intra-axial lesion' },
              { id: 'meningioma', label: 'Meningioma', desc: 'Dural-based extra-axial mass' },
              { id: 'pituitary', label: 'Pituitary', desc: 'Sellar / suprasellar mass' },
              { id: 'notumor', label: 'No Tumor', desc: 'Normal brain parenchyma' },
            ].map((cat) => {
              const count = classCounts[cat.id] || 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {count} cases ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: cat.id === 'notumor' ? '#059669' : '#1e40af',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Governance Disclaimer */}
          <div
            style={{
              marginTop: '18px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-primary)',
              fontSize: 'var(--font-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <strong>Decision Support Safeguard:</strong> This research prototype provides preliminary triage prioritization and Grad-CAM model explainability. It does not provide autonomous clinical diagnoses. Final diagnosis remains with the qualified radiologist.
          </div>
        </div>
      </div>
    </div>
  );
}
