import React from 'react';
import { TriageBadge, StatusBadge, ClassBadge } from '../common/Badge';
import { IconEye, IconFileText } from '../common/Icons';
import { safePercent, safeString } from '../../utils/format';

export function WorklistTable({
  scans,
  selectedScanId,
  onSelectScan,
  onNewScanClick,
}) {
  if (!scans || scans.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--text-muted)',
          }}
        >
          <IconFileText size={24} />
        </div>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          No analyzed cases in worklist
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-base)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
          Upload a brain MRI scan or load a sample case to populate the AI triage worklist.
        </p>
        <button
          onClick={onNewScanClick}
          style={{
            padding: '8px 18px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: 'var(--font-sm)',
          }}
        >
          Upload First Brain MRI
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderBottom: '1px solid var(--border-primary)',
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              <th style={{ padding: '12px 16px', width: '150px' }}>Triage Priority</th>
              <th style={{ padding: '12px 16px' }}>Case Reference</th>
              <th style={{ padding: '12px 16px', width: '140px' }}>AI Prediction</th>
              <th style={{ padding: '12px 16px', width: '110px' }}>Confidence</th>
              <th style={{ padding: '12px 16px', width: '160px' }}>Uncertainty Profile</th>
              <th style={{ padding: '12px 16px', width: '130px' }}>Status</th>
              <th style={{ padding: '12px 16px', width: '140px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px', width: '100px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan, idx) => {
              const isSelected = scan.id === selectedScanId;
              const isPriority = scan.triage_bucket === 'low_confidence';
              const dateStr = scan.uploaded_at
                ? new Date(scan.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—';

              return (
                <tr
                  key={scan.id || idx}
                  onClick={() => onSelectScan(scan.id)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: isSelected
                      ? 'var(--accent-light)'
                      : isPriority
                      ? 'rgba(254, 242, 242, 0.4)'
                      : idx % 2 === 0
                      ? 'var(--bg-surface)'
                      : 'rgba(248, 250, 252, 0.6)',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  className="worklist-row"
                >
                  {/* Triage Priority Badge */}
                  <td style={{ padding: '12px 16px' }}>
                    <TriageBadge bucket={scan.triage_bucket} size="small" />
                  </td>

                  {/* Case Reference */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: 'var(--font-base)', color: 'var(--text-primary)' }}>
                        {safeString(scan.patient_ref, 'Unlabeled Case')}
                      </strong>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {scan.id ? `${scan.id.slice(0, 8)}...` : '—'}
                      </span>
                    </div>
                  </td>

                  {/* Prediction */}
                  <td style={{ padding: '12px 16px' }}>
                    <ClassBadge findingClass={scan.predicted_class} />
                  </td>

                  {/* Confidence % */}
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                    {safePercent(scan.confidence)}
                  </td>

                  {/* Uncertainty Profile */}
                  <td style={{ padding: '12px 16px', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>
                        Entropy: <strong>{scan.uncertainty?.normalized_entropy != null ? String(scan.uncertainty.normalized_entropy) : 'N/A'}</strong>
                      </span>
                      <span>
                        MC Std: <strong>{scan.uncertainty?.mc_dropout_std != null ? String(scan.uncertainty.mc_dropout_std) : 'N/A'}</strong>
                      </span>
                    </div>
                  </td>

                  {/* Workflow Status */}
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={scan.status} size="small" />
                  </td>

                  {/* Timestamp */}
                  <td style={{ padding: '12px 16px', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    {dateStr}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectScan(scan.id);
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-secondary)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <IconEye size={12} />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
