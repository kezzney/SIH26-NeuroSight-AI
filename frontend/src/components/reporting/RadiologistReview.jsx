import React, { useState, useEffect } from 'react';
import { IconCheckCircle } from '../common/Icons';
import { StatusBadge } from '../common/Badge';

export function RadiologistReview({ scan, onSaveReview, isSaving }) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('reviewed');

  useEffect(() => {
    if (scan) {
      setNote(scan.radiologist_note ?? scan.report_note ?? scan.structured_report?.draft_note ?? '');
      setStatus(scan.status || 'pending');
    }
  }, [scan]);

  if (!scan) return null;

  function handleInsertPhrase(phrase) {
    setNote((prev) => (prev ? `${prev}\n\n${phrase}` : phrase));
  }

  async function handleSave(newStatus) {
    const targetStatus = newStatus || status;
    await onSaveReview(scan.id, {
      radiologist_note: note,
      status: targetStatus,
    });
  }

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
        <div>
          <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Radiologist Review & Sign-Off
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Human-in-the-Loop Clinical Verification
          </span>
        </div>
        <StatusBadge status={scan.status} />
      </div>

      {/* Quick Clinical Templates */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          INSERT CLINICAL TEMPLATE:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleInsertPhrase('Findings consistent with preliminary AI classification. No acute midline shift or secondary mass effect.')}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            + Findings Consistent
          </button>

          <button
            type="button"
            onClick={() => handleInsertPhrase('Attention focus verified; recommend multi-sequence contrast MRI to characterize lesion vascularity.')}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            + Recommend Contrast MRI
          </button>

          <button
            type="button"
            onClick={() => handleInsertPhrase('AI pre-read approved and signed after radiologist cross-verification.')}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            + Pre-read Verified
          </button>
        </div>
      </div>

      {/* Editable Note Textarea */}
      <div style={{ marginBottom: '16px' }}>
        <textarea
          rows={6}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter radiologist impression, modifications, or clinical notes..."
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 'var(--font-sm)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            resize: 'vertical',
          }}
        />
      </div>

      {/* Action Buttons & Status Transitions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            WORKFLOW STATE:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 'var(--font-xs)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved & Signed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleSave('reviewed')}
            disabled={isSaving}
            style={{
              padding: '8px 14px',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              backgroundColor: 'var(--bg-surface-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSave('approved')}
            disabled={isSaving}
            style={{
              padding: '8px 18px',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              backgroundColor: '#047857',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconCheckCircle size={15} />
            <span>{isSaving ? 'Saving...' : 'Approve & Sign Case'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
