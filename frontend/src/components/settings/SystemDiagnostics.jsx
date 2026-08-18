import React, { useState } from 'react';
import { IconSliders, IconActivity, IconRefreshCw, IconCheckCircle, IconAlertTriangle } from '../common/Icons';
import { api } from '../../services/api';

export function SystemDiagnostics({ systemHealth, onRefreshHealth, isRefreshing }) {
  const [testLatency, setTestLatency] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const apiBase = api.getBaseUrl();
  const isBackendOk = systemHealth?.status === 'ok';
  const isModelLoaded = Boolean(systemHealth?.model_loaded);

  async function handleRunDiagnostic() {
    setIsTesting(true);
    const start = performance.now();
    try {
      await api.checkHealth();
      const end = performance.now();
      setTestLatency(Math.round(end - start));
      await onRefreshHealth();
    } catch {
      setTestLatency(-1);
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Title */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <IconSliders size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            System Diagnostics & Connectivity
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
          Verify runtime health, FastAPI endpoint connectivity, and TensorFlow model weight initialization.
        </p>
      </div>

      {/* Connectivity Status Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Backend API Node */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isBackendOk ? 'var(--priority-low-border)' : 'var(--priority-high-border)'}`,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>FASTAPI BACKEND</span>
            {isBackendOk ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                <IconCheckCircle size={14} /> Connected
              </span>
            ) : (
              <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                <IconAlertTriangle size={14} /> Unreachable
              </span>
            )}
          </div>
          <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {apiBase}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Endpoint: GET /api/health
          </div>
        </div>

        {/* Model Checkpoint Status */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isModelLoaded ? 'var(--priority-low-border)' : 'var(--priority-mod-border)'}`,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>TENSORFLOW E5 MODEL</span>
            {isModelLoaded ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                <IconCheckCircle size={14} /> Initialized
              </span>
            ) : (
              <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                <IconAlertTriangle size={14} /> Checkpoint Missing
              </span>
            )}
          </div>
          <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isModelLoaded ? 'E5_TwoStage_best.keras' : 'Weight file not found in models/'}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified Accuracy: 88.75% (1,600 test images)
          </div>
        </div>

        {/* Latency Ping */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>API ROUND-TRIP TIME</span>
            <IconActivity size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {testLatency === null ? '—' : testLatency === -1 ? 'Failed' : `${testLatency} ms`}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Local loopback latency
          </div>
        </div>
      </div>

      {/* Manual Diagnostic Trigger */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)', display: 'block' }}>
            Run Active Ping & Health Probe
          </strong>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            Executes a direct HTTP request to /api/health to measure response time and model status.
          </span>
        </div>
        <button
          onClick={handleRunDiagnostic}
          disabled={isTesting || isRefreshing}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: 'var(--font-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <IconRefreshCw size={14} className={isTesting ? 'spin-anim' : ''} />
          <span>{isTesting ? 'Pinging…' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {/* Troubleshooting Guide */}
      {!isBackendOk && (
        <div
          style={{
            backgroundColor: 'var(--priority-high-bg)',
            border: '1px solid var(--priority-high-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            color: 'var(--priority-high-text)',
          }}
        >
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '8px' }}>
            Backend Offline - Troubleshooting Steps
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', marginBottom: '12px', lineHeight: 1.4 }}>
            The frontend is currently unable to communicate with the FastAPI server at <code>{apiBase}</code>.
          </p>
          <ol style={{ fontSize: 'var(--font-xs)', paddingLeft: '20px', lineHeight: 1.6 }}>
            <li>Open a terminal in the <code>backend/</code> directory.</li>
            <li>Activate your Python virtual environment (with TensorFlow installed).</li>
            <li>Start the FastAPI server: <code>uvicorn app.main:app --reload --port 8000</code></li>
            <li>Ensure <code>E5_TwoStage_best.keras</code> is present in <code>backend/models/</code>.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
