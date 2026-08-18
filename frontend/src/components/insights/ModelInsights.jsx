import React from 'react';
import { IconBrain, IconCheckCircle } from '../common/Icons';

export function ModelInsights() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title Header */}
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
          <IconBrain size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            E5 Two-Stage Neural Architecture & Methodology
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
          Technical specification of the deep learning pipeline, uncertainty estimation formulation, and explainability translation layer.
        </p>
      </div>

      {/* Verified Benchmark Metrics Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>VERIFIED ACCURACY</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#38bdf8', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>88.75%</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Held-out test benchmark</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TEST DATASET</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>1,600</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Independent test images</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>INPUT DIMENSIONS</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>224 × 224</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>3-channel RGB MRI slice</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>MULTI-CLASS TARGETS</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>4 Classes</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Glioma, Meningioma, Pituitary, Normal</div>
        </div>
      </div>

      {/* Model Pipeline Flow Diagram */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          End-to-End Inference Pipeline
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {[
            { step: '1. Preprocessing', detail: '224×224 RGB resizing with EfficientNet zero-mean scaling' },
            { step: '2. Spatial Extraction', detail: 'EfficientNetB3 backbone extracts high-order convolutional features' },
            { step: '3. Sequence Modeling', detail: 'Dual-layer LSTM processes spatial feature representation' },
            { step: '4. Soft Attention', detail: 'Learned attention weights W and b focus on pathological regions' },
            { step: '5. Classification & CAM', detail: '4-class Softmax + Grad-CAM target activation heatmap' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                {item.step}
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Technical Explanations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Shannon Entropy & MC-Dropout */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Dual-Signal Uncertainty Formulation
            </h4>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
              Standard softmax confidence can be deceptively overconfident on out-of-distribution or ambiguous scans. NeuroSight computes two complementary signals:
            </p>
            <ul style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.5 }}>
              <li>
                <strong>Predictive Entropy:</strong> Measures softmax dispersion across all 4 classes ($-\sum p \log p / \log 4$).
              </li>
              <li>
                <strong>15-Pass Monte Carlo Dropout:</strong> Activates dropout layers during inference ($training=True$) to measure prediction variance. High variance triggers priority review.
              </li>
            </ul>
          </div>

          {/* Grad-CAM Explainability */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Grad-CAM Visual Localization
            </h4>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
              Gradient-Weighted Class Activation Mapping backpropagates gradients from the top predicted class score to the final convolutional layer (<code>top_conv</code>).
            </p>
            <ul style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.5 }}>
              <li>Generates coarse 2D spatial attention heatmaps.</li>
              <li>Visualizes where the neural network concentrated its focus.</li>
              <li>Supports radiologist validation while explicitly preserving human clinical authority.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Qualitative Clinical Workflow Value */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Qualitative Workflow & Hospital Impact
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {[
            { title: 'Automated Preliminary Triage', desc: 'Pre-screens incoming scans to organize daily worklists before radiologist review.' },
            { title: 'Uncertainty-Aware Safety', desc: 'High-uncertainty cases are automatically flagged for immediate specialist review rather than buried in standard queues.' },
            { title: 'Explainability Translation', desc: 'Converts raw gradient activations into structured anatomical drafts with region context.' },
            { title: 'Human-in-the-Loop Sign-Off', desc: 'Radiologist maintains final clinical authority, editing pre-reads and formally approving cases.' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px' }}>
              <IconCheckCircle size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--text-primary)', display: 'block' }}>{item.title}</strong>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
