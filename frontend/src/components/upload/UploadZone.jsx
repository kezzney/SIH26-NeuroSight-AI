import React, { useState, useRef } from 'react';
import { IconUpload, IconFileText, IconX, IconBrain } from '../common/Icons';

export function UploadZone({ onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [patientRef, setPatientRef] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const fileInputRef = useRef(null);

  function handleFileSelect(file) {
    if (!file) return;
    setValidationError(null);

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg'];
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
    const hasValidMime = validMimes.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setValidationError('Unsupported format. Please select a valid JPG or PNG MRI image.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setValidationError('File exceeds 25MB limit.');
      return;
    }

    setSelectedFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleClear() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile || isUploading) return;
    const ref = patientRef.trim() || `CASE-${Date.now().toString().slice(-6)}`;
    try {
      await onUpload(selectedFile, ref);
      handleClear();
      setPatientRef('');
    } catch (err) {
      setValidationError(`Upload failed: ${err.message || 'Server error'}`);
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Analyze Brain MRI Scan
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
          Submit an axial brain MRI slice (T1/T2 post-contrast) to obtain 4-class prediction, uncertainty scoring, and Grad-CAM explainability.
        </p>
      </div>

      {validationError && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--priority-high-bg)',
            color: 'var(--priority-high-text)',
            border: '1px solid var(--priority-high-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-sm)',
            marginBottom: '16px',
          }}
        >
          {validationError}
        </div>
      )}

      {/* Drag and Drop Box */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-secondary)'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: isDragOver ? 'var(--accent-light)' : 'var(--bg-surface-secondary)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: 'var(--accent-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <IconUpload size={22} />
          </div>
          <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Click or drag & drop brain MRI scan here
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            Supports JPG, JPEG, and PNG images (max 25MB)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        /* Selected File Preview Box */
        <div
          style={{
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            backgroundColor: 'var(--bg-surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt="MRI Preview"
              style={{
                width: '70px',
                height: '70px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-secondary)',
                backgroundColor: '#000000',
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFileText size={15} style={{ color: 'var(--accent-primary)' }} />
              <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </strong>
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
              Size: {(selectedFile.size / 1024).toFixed(1)} KB · Format: {selectedFile.type || 'image/jpeg'}
            </div>
          </div>
          <button
            onClick={handleClear}
            disabled={isUploading}
            style={{
              padding: '6px 10px',
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <IconX size={12} />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* Case Reference Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Case Reference / Patient Identifier (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. RAD-2026-0941, MRI-PT-104..."
            value={patientRef}
            onChange={(e) => setPatientRef(e.target.value)}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 'var(--font-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Avoid entering sensitive Personally Identifiable Information (PII). Anonymized case codes are recommended.
          </span>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          style={{
            padding: '12px 20px',
            backgroundColor: !selectedFile || isUploading ? 'var(--bg-surface-tertiary)' : 'var(--accent-primary)',
            color: !selectedFile || isUploading ? 'var(--text-muted)' : '#ffffff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: 'var(--font-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          <IconBrain size={18} />
          <span>{isUploading ? 'Executing E5 Model Inference & Grad-CAM…' : 'Run AI Analysis'}</span>
        </button>
      </form>
    </div>
  );
}
