import React from 'react';
import { ClassBadge } from '../common/Badge';
import { safePercent, safeUpper, safeFloat } from '../../utils/format';

export function ClassificationCard({ scan }) {
  if (!scan) return null;

  const probs = scan.class_probabilities || {};
  const entries = Object.entries(probs).sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const primary = entries[0] || [scan.predicted_class, scan.confidence];
  const secondary = entries[1] || [null, 0];

  const primaryConf = typeof primary[1] === 'number' ? primary[1] : scan.confidence || 0;
  const secondaryConf = typeof secondary[1] === 'number' ? secondary[1] : 0;
  const marginGap = (primaryConf - secondaryConf) * 100;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            AI-Assisted Classification
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {safeUpper(primary[0] || scan.predicted_class, 'UNKNOWN')}
            </h2>
            <ClassBadge findingClass={scan.predicted_class} />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Model Softmax Confidence
          </span>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-mono)',
              marginTop: '4px',
            }}
          >
            {safePercent(scan.confidence)}
          </div>
        </div>
      </div>

      {/* Competing Class & Probability Gap Metric */}
      {secondary[0] && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
            fontSize: 'var(--font-xs)',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Next Competing Class: </span>
            <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {secondary[0]} ({safePercent(secondaryConf)})
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--text-muted)' }}>Probability Gap Margin: </span>
            <strong style={{ color: marginGap > 40 ? '#047857' : '#b45309', fontFamily: 'var(--font-mono)' }}>
              +{safeFloat(marginGap, 1)}%
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
