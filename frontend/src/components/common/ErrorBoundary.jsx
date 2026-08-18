import React from 'react';
import { IconAlertTriangle, IconRotateCcw } from './Icons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Workstation Error Boundary caught an exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px 24px',
            maxWidth: '600px',
            margin: '60px auto',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--priority-high-border)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--priority-high-bg)',
              color: 'var(--priority-high-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <IconAlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Workstation Display Recovery
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
            A rendering exception was intercepted. The workstation state is protected and the server remains active.
          </p>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              color: '#dc2626',
              fontFamily: 'var(--font-mono)',
              textAlign: 'left',
              marginBottom: '20px',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error?.message || 'Unknown runtime exception'}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconRotateCcw size={14} />
            <span>Reload Workstation</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
