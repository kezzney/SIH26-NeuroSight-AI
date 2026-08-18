import React from 'react';

const TRIAGE_CONFIG = {
  low_confidence: {
    label: 'Priority Review',
    color: 'var(--priority-high-text)',
    bg: 'var(--priority-high-bg)',
    border: 'var(--priority-high-border)',
    dot: 'var(--priority-high-accent)',
  },
  moderate_confidence: {
    label: 'Standard Review',
    color: 'var(--priority-mod-text)',
    bg: 'var(--priority-mod-bg)',
    border: 'var(--priority-mod-border)',
    dot: 'var(--priority-mod-accent)',
  },
  high_confidence: {
    label: 'Standard Queue',
    color: 'var(--priority-low-text)',
    bg: 'var(--priority-low-bg)',
    border: 'var(--priority-low-border)',
    dot: 'var(--priority-low-accent)',
  },
};

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'var(--status-pending-text)',
    bg: 'var(--status-pending-bg)',
    border: 'var(--status-pending-border)',
  },
  reviewed: {
    label: 'Reviewed',
    color: 'var(--status-reviewed-text)',
    bg: 'var(--status-reviewed-bg)',
    border: 'var(--status-reviewed-border)',
  },
  approved: {
    label: 'Approved & Signed',
    color: 'var(--status-approved-text)',
    bg: 'var(--status-approved-bg)',
    border: 'var(--status-approved-border)',
  },
};

const CLASS_FORMAT = {
  glioma: 'Glioma',
  meningioma: 'Meningioma',
  notumor: 'No Tumor',
  pituitary: 'Pituitary',
};

export function TriageBadge({ bucket, showDot = true, size = 'normal' }) {
  const config = TRIAGE_CONFIG[bucket] || TRIAGE_CONFIG.moderate_confidence;
  const padding = size === 'small' ? '2px 6px' : '3px 8px';
  const fontSize = size === 'small' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        fontSize,
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-sm)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.dot,
          }}
        />
      )}
      {config.label}
    </span>
  );
}

export function StatusBadge({ status, size = 'normal' }) {
  const normStatus = (status || 'pending').toLowerCase();
  const config = STATUS_CONFIG[normStatus] || STATUS_CONFIG.pending;
  const padding = size === 'small' ? '2px 6px' : '3px 8px';
  const fontSize = size === 'small' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        fontSize,
        fontWeight: 500,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-sm)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}

export function ClassBadge({ findingClass }) {
  const name = CLASS_FORMAT[findingClass?.toLowerCase()] || findingClass || 'Unknown';
  const isNoTumor = findingClass?.toLowerCase() === 'notumor';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        fontSize: '12px',
        fontWeight: 600,
        color: isNoTumor ? '#065f46' : '#1e3a8a',
        backgroundColor: isNoTumor ? '#d1fae5' : '#dbeafe',
        border: `1px solid ${isNoTumor ? '#a7f3d0' : '#bfdbfe'}`,
        borderRadius: 'var(--radius-xs)',
      }}
    >
      {name}
    </span>
  );
}
