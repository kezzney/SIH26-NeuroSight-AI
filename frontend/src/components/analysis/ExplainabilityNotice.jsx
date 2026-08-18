import React from 'react';
import { IconShield } from '../common/Icons';

export function ExplainabilityNotice() {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-primary)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        fontSize: 'var(--font-xs)',
        color: 'var(--text-secondary)',
        lineHeight: 1.4,
      }}
    >
      <IconShield size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
          Model Attention & Explainability Governance:
        </strong>
        Highlighted regions indicate convolutional features contributing to the model's classification score. This visualization supports clinical interpretation and spatial validation, but is not a definitive lesion segmentation boundary.
      </div>
    </div>
  );
}
