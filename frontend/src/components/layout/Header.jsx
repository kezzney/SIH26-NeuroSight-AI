import React from 'react';
import { IconBrain, IconActivity, IconFileText, IconUpload, IconDatabase, IconSliders, IconRefreshCw } from '../common/Icons';

export function Header({
  activeTab,
  onSelectTab,
  totalScansCount,
  pendingCount,
  systemHealth,
  onRefreshHealth,
  isRefreshing,
}) {
  const isBackendOk = systemHealth?.status === 'ok';
  const isModelLoaded = Boolean(systemHealth?.model_loaded);

  return (
    <header
      className="no-print"
      style={{
        backgroundColor: '#0b132b',
        color: '#ffffff',
        borderBottom: '1px solid #1c2541',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Top Brand & Diagnostic Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 0 10px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: '#1c2541',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #3a506b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
            }}
          >
            <IconBrain size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px' }}>
                NEUROSIGHT AI
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '1px 6px',
                  backgroundColor: '#1c2541',
                  color: '#93c5fd',
                  borderRadius: '3px',
                  border: '1px solid #3a506b',
                }}
              >
                SIH 2026 Workstation
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
              Explainable Brain MRI Triage & Decision Support
            </div>
          </div>
        </div>

        {/* Live System Diagnostics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '12px',
            }}
          >
            {/* Backend Node */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isBackendOk ? '#10b981' : '#ef4444',
                }}
              />
              <span style={{ color: '#94a3b8' }}>FastAPI:</span>
              <span style={{ fontWeight: 600, color: isBackendOk ? '#e2e8f0' : '#f87171' }}>
                {isBackendOk ? 'Online' : 'Offline'}
              </span>
            </div>

            <span style={{ color: '#334155' }}>|</span>

            {/* Model State */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isModelLoaded ? '#10b981' : '#f59e0b',
                }}
              />
              <span style={{ color: '#94a3b8' }}>E5 Model:</span>
              <span style={{ fontWeight: 600, color: isModelLoaded ? '#e2e8f0' : '#fbbf24' }}>
                {isModelLoaded ? 'Loaded (88.75%)' : 'Unavailable'}
              </span>
            </div>

            <button
              onClick={onRefreshHealth}
              disabled={isRefreshing}
              title="Refresh system health status"
              style={{
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                marginLeft: '4px',
              }}
            >
              <IconRefreshCw size={12} className={isRefreshing ? 'spin-anim' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          gap: '2px',
          borderTop: '1px solid #172038',
        }}
      >
        <button
          onClick={() => onSelectTab('command-center')}
          style={{
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'command-center' ? '#ffffff' : '#94a3b8',
            borderBottom: activeTab === 'command-center' ? '2px solid #3b82f6' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'command-center' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          <IconActivity size={15} />
          <span>Command Center</span>
        </button>

        <button
          onClick={() => onSelectTab('worklist')}
          style={{
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'worklist' ? '#ffffff' : '#94a3b8',
            borderBottom: activeTab === 'worklist' ? '2px solid #3b82f6' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'worklist' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          <IconFileText size={15} />
          <span>Worklist</span>
          {totalScansCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: pendingCount > 0 ? '#b91c1c' : '#334155',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {pendingCount > 0 ? `${pendingCount} pending` : totalScansCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('new-scan')}
          style={{
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'new-scan' ? '#ffffff' : '#94a3b8',
            borderBottom: activeTab === 'new-scan' ? '2px solid #3b82f6' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'new-scan' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          <IconUpload size={15} />
          <span>New Scan</span>
        </button>

        <button
          onClick={() => onSelectTab('analysis')}
          style={{
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'analysis' ? '#ffffff' : '#94a3b8',
            borderBottom: activeTab === 'analysis' ? '2px solid #3b82f6' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'analysis' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          <IconBrain size={15} />
          <span>Scan Analysis</span>
        </button>

        <button
          onClick={() => onSelectTab('insights')}
          style={{
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'insights' ? '#ffffff' : '#94a3b8',
            borderBottom: activeTab === 'insights' ? '2px solid #3b82f6' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'insights' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          <IconDatabase size={15} />
          <span>Model Insights</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          style={{
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'settings' ? '#ffffff' : '#94a3b8',
            borderBottom: activeTab === 'settings' ? '2px solid #3b82f6' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'settings' ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
        >
          <IconSliders size={15} />
          <span>Diagnostics</span>
        </button>
      </nav>
    </header>
  );
}
