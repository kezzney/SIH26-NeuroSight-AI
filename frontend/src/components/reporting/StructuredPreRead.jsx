import React from 'react';
import { IconFileText } from '../common/Icons';

export function StructuredPreRead({ scan }) {
  if (!scan) return null;

  const structured = scan.structured_report || {};
  const draftNote = scan.report_note || structured.draft_note || 'Pre-read note unavailable.';

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
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconFileText size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>AI-Assisted Structured Pre-Read</span>
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Translation Layer Output
        </span>
      </div>

      {/* Structured Fields Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '14px',
          fontSize: 'var(--font-xs)',
        }}
      >
        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-xs)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>FINDING CATEGORY</span>
          <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
            {structured.finding_class || scan.predicted_class}
          </strong>
        </div>

        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-xs)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>TRIAGE BUCKET</span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {(structured.triage_bucket || scan.triage_bucket || '').replace('_', ' ').toUpperCase()}
          </strong>
        </div>
      </div>

      {/* Anatomical Region Note */}
      {structured.region_note && (
        <div style={{ marginBottom: '12px', fontSize: 'var(--font-xs)' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Spatial Pattern: </span>
          <span style={{ color: 'var(--text-secondary)' }}>{structured.region_note}</span>
        </div>
      )}

      {/* Generated Clinical Note */}
      <div>
        <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          Preliminary Clinical Note
        </label>
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {draftNote}
        </div>
      </div>
    </div>
  );
}
