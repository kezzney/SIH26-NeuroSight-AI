import React, { useEffect } from 'react';
import { IconCheckCircle, IconAlertTriangle, IconInfo, IconX } from './Icons';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: `4px solid ${isError ? 'var(--priority-high-accent)' : isSuccess ? 'var(--priority-low-accent)' : 'var(--accent-primary)'}`,
        fontSize: 'var(--font-base)',
        maxWidth: '420px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {isError && <IconAlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />}
      {isSuccess && <IconCheckCircle size={18} style={{ color: '#4ade80', flexShrink: 0 }} />}
      {!isError && !isSuccess && <IconInfo size={18} style={{ color: '#60a5fa', flexShrink: 0 }} />}

      <div style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</div>

      <button
        onClick={onClose}
        style={{
          color: '#94a3b8',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
        aria-label="Dismiss notification"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}
