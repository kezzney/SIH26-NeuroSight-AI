import React from 'react';

const CLASS_LABELS = {
  glioma: 'Glioma (Infiltrative)',
  meningioma: 'Meningioma (Dural-based)',
  notumor: 'No Tumor (Normal Parenchyma)',
  pituitary: 'Pituitary (Sellar/Suprasellar)',
};

export function ProbabilityBars({ probabilities, predictedClass }) {
  if (!probabilities) return null;

  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
          4-Class Posterior Probabilities
        </h3>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          Softmax Distribution
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.map(([cls, prob]) => {
          const isTop = cls === predictedClass;
          const pct = (prob * 100).toFixed(1);
          const label = CLASS_LABELS[cls] || cls;

          return (
            <div key={cls} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--font-xs)',
                  fontWeight: isTop ? 700 : 500,
                  color: isTop ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <span>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{pct}%</span>
              </div>
              <div
                style={{
                  height: isTop ? '10px' : '8px',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: isTop ? '1px solid var(--accent-border)' : 'none',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: isTop
                      ? 'var(--accent-primary)'
                      : cls === 'notumor'
                      ? '#10b981'
                      : '#94a3b8',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
