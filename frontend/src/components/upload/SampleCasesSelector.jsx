import React, { useState } from 'react';
import { IconBrain, IconActivity } from '../common/Icons';

const SAMPLE_CASES = [
  {
    id: 'sample_glioma',
    title: 'Sample Case: Glioma',
    category: 'Glioma',
    path: '/samples/glioma_case_01.jpg',
    description: 'Infiltrative hyperintense mass in cerebral white matter',
    patientRef: 'DEMO-GLIOMA-01',
    findingClass: 'glioma',
  },
  {
    id: 'sample_meningioma',
    title: 'Sample Case: Meningioma',
    category: 'Meningioma',
    path: '/samples/meningioma_case_02.jpg',
    description: 'Dural-based extra-axial well-circumscribed mass',
    patientRef: 'DEMO-MENING-02',
    findingClass: 'meningioma',
  },
  {
    id: 'sample_pituitary',
    title: 'Sample Case: Pituitary',
    category: 'Pituitary',
    path: '/samples/pituitary_case_03.jpg',
    description: 'Sellar/suprasellar mass with expansion of sella turcica',
    patientRef: 'DEMO-PITUITARY-03',
    findingClass: 'pituitary',
  },
  {
    id: 'sample_normal',
    title: 'Sample Case: Normal Brain',
    category: 'No Tumor',
    path: '/samples/normal_brain_axial.jpg',
    description: 'Normal anatomical parenchyma, symmetric ventricles',
    patientRef: 'DEMO-NOTUMOR-04',
    findingClass: 'notumor',
  },
];

export function SampleCasesSelector({ onSelectSample, isUploading }) {
  const [loadingId, setLoadingId] = useState(null);

  async function handleLoadSample(sample) {
    if (isUploading) return;
    setLoadingId(sample.id);
    try {
      // Fetch the actual image file from the public samples directory
      const response = await fetch(sample.path);
      if (!response.ok) throw new Error(`Could not load sample MRI at ${sample.path}`);
      const blob = await response.blob();
      const file = new File([blob], `${sample.findingClass}_scan.jpg`, { type: 'image/jpeg' });
      await onSelectSample(file, sample.patientRef);
    } catch (err) {
      console.error('Failed to load sample MRI:', err);
    } finally {
      setLoadingId(null);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconBrain size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>SIH Presentation Demo Mode (Sample Scans)</span>
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#1e40af',
            backgroundColor: '#eff6ff',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #bfdbfe',
          }}
        >
          Feeds Real Inference Pipeline
        </span>
      </div>

      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
        Select a verified representative MRI case to evaluate directly through the live TensorFlow E5 model, uncertainty computation, and Grad-CAM localization.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {SAMPLE_CASES.map((sample) => {
          const isCurrentLoading = loadingId === sample.id;
          return (
            <div
              key={sample.id}
              style={{
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                backgroundColor: 'var(--bg-surface-secondary)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                    {sample.category}
                  </strong>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {sample.patientRef}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {sample.description}
                </div>
              </div>

              <button
                onClick={() => handleLoadSample(sample)}
                disabled={isUploading || isCurrentLoading}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  backgroundColor: isCurrentLoading ? 'var(--bg-surface-tertiary)' : '#ffffff',
                  color: isCurrentLoading ? 'var(--text-muted)' : 'var(--accent-primary)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <IconActivity size={13} />
                <span>{isCurrentLoading ? 'Uploading & Analyzing…' : 'Run Real Analysis'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
