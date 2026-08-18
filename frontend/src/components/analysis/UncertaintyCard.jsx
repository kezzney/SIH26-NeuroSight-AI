import React from 'react';
import { TriageBadge } from '../common/Badge';
import { IconActivity, IconInfo } from '../common/Icons';
import { safeFloat } from '../../utils/format';

export function UncertaintyCard({ uncertainty }) {
  if (!uncertainty) return null;

  const entropy = typeof uncertainty.normalized_entropy === 'number' ? uncertainty.normalized_entropy : parseFloat(uncertainty.normalized_entropy) || 0;
  const mcStd = typeof uncertainty.mc_dropout_std === 'number' ? uncertainty.mc_dropout_std : parseFloat(uncertainty.mc_dropout_std) || 0;
  const bucket = uncertainty.bucket;
  const isPriority = bucket === 'low_confidence';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isPriority ? 'var(--priority-high-border)' : 'var(--border-primary)'}`,
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconActivity size={16} style={{ color: isPriority ? 'var(--priority-high-accent)' : 'var(--accent-primary)' }} />
            <span>Prediction Reliability & Triage Assessment</span>
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Dual-signal: Shannon Entropy + 15-Pass Monte Carlo Dropout
          </span>
        </div>
        <TriageBadge bucket={bucket} />
      </div>

      {/* Action Recommendation Callout */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isPriority ? 'var(--priority-high-bg)' : 'var(--bg-surface-secondary)',
          border: `1px solid ${isPriority ? 'var(--priority-high-border)' : 'var(--border-primary)'}`,
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            color: isPriority ? 'var(--priority-high-text)' : 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}
        >
          Recommended Triage Action:
        </div>
        <div
          style={{
            fontSize: 'var(--font-sm)',
            color: isPriority ? 'var(--priority-high-text)' : 'var(--text-secondary)',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {uncertainty.recommended_action || 'Review scan interpretation.'}
        </div>
      </div>

      {/* Uncertainty Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        {/* Normalized Predictive Entropy */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            <span>SHANNON ENTROPY</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {safeFloat(entropy, 4)}
            </span>
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: 'var(--bg-surface-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(entropy * 100, 100)}%`,
                backgroundColor: entropy > 0.5 ? '#dc2626' : entropy > 0.25 ? '#d97706' : '#059669',
              }}
            />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            0 = certain · 1 = maximum dispersion
          </span>
        </div>

        {/* MC-Dropout Stochastic Std */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            <span>MC-DROPOUT VARIANCE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {safeFloat(mcStd, 4)}
            </span>
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: 'var(--bg-surface-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(mcStd * 500, 100)}%`,
                backgroundColor: mcStd > 0.12 ? '#dc2626' : mcStd > 0.05 ? '#d97706' : '#059669',
              }}
            />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Stochastic forward pass deviation
          </span>
        </div>
      </div>

      {/* Uncertainty Principle Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.3,
        }}
      >
        <IconInfo size={14} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />
        <span>
          <strong>Clinical Principle:</strong> AI confidence is not equivalent to diagnostic certainty. Cases with high softmax probability but elevated MC wobble are escalated for priority radiologist review.
        </span>
      </div>
    </div>
  );
}
