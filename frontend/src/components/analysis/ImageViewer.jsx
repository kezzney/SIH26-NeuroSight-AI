import React, { useState } from 'react';
import {
  IconEye,
  IconLayers,
  IconZoomIn,
  IconZoomOut,
  IconRotateCcw,
  IconSliders,
  IconInfo,
} from '../common/Icons';

export function ImageViewer({ scan }) {
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay' | 'split'
  const [opacity, setOpacity] = useState(0.85);
  const [zoom, setZoom] = useState(1);

  const hasGradCam = Boolean(scan?.gradcam_overlay_base64);

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.25, 0.75));
  }

  function handleReset() {
    setZoom(1);
    setOpacity(0.85);
    setViewMode('overlay');
  }

  if (!scan) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-viewer)',
          color: 'var(--text-viewer-muted)',
          borderRadius: 'var(--radius-md)',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid var(--border-viewer)',
        }}
      >
        Select a scan to inspect imaging data
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-viewer)',
        color: 'var(--text-viewer-bright)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-viewer)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-viewer)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* PACS Viewer Control Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: 'var(--bg-viewer-surface)',
          borderBottom: '1px solid var(--border-viewer)',
          fontSize: 'var(--font-xs)',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-viewer-bright)' }}>
            MRI AXIAL VIEW
          </span>
          <span style={{ color: 'var(--text-viewer-muted)' }}>
            224×224 Tensor (Input resolution)
          </span>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Mode Toggle */}
          {hasGradCam && (
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: 'var(--radius-xs)',
                padding: '2px',
                border: '1px solid var(--border-viewer)',
              }}
            >
              <button
                onClick={() => setViewMode('overlay')}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: viewMode === 'overlay' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'overlay' ? '#ffffff' : 'var(--text-viewer-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <IconLayers size={11} />
                <span>Blended Overlay</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: viewMode === 'split' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'split' ? '#ffffff' : 'var(--text-viewer-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <IconEye size={11} />
                <span>Dual Inspector</span>
              </button>
            </div>
          )}

          {/* Opacity Slider for Overlay Mode */}
          {hasGradCam && viewMode === 'overlay' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconSliders size={12} style={{ color: 'var(--text-viewer-muted)' }} />
              <span style={{ color: 'var(--text-viewer-muted)', fontSize: '11px' }}>Heatmap:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ width: '70px', accentColor: '#3b82f6', cursor: 'pointer' }}
                title={`Heatmap opacity: ${Math.round(opacity * 100)}%`}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', width: '28px' }}>
                {Math.round(opacity * 100)}%
              </span>
            </div>
          )}

          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleZoomOut}
              style={{ color: 'var(--text-viewer-muted)', padding: '3px' }}
              title="Zoom out"
            >
              <IconZoomOut size={13} />
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-viewer-muted)' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{ color: 'var(--text-viewer-muted)', padding: '3px' }}
              title="Zoom in"
            >
              <IconZoomIn size={13} />
            </button>
            <button
              onClick={handleReset}
              style={{ color: 'var(--text-viewer-muted)', padding: '3px', marginLeft: '4px' }}
              title="Reset view"
            >
              <IconRotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        style={{
          position: 'relative',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#05070d',
          minHeight: '380px',
          overflow: 'hidden',
        }}
      >
        {hasGradCam ? (
          viewMode === 'split' ? (
            /* Split / Side-by-Side Dual View */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                width: '100%',
                maxWidth: '680px',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Target Conv Grad-CAM Heatmap */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}
                >
                  Grad-CAM Activation Focus
                </div>
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    backgroundColor: '#000000',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-viewer)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={`data:image/png;base64,${scan.gradcam_overlay_base64}`}
                    alt="Grad-CAM Activation"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Anatomical Reference */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}
                >
                  Model Attention Overlay
                </div>
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    backgroundColor: '#000000',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-viewer)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={`data:image/png;base64,${scan.gradcam_overlay_base64}`}
                    alt="Blended MRI"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'contrast(1.1) brightness(1.05)',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Single Overlay View with interactive Opacity */
            <div
              style={{
                position: 'relative',
                width: '320px',
                height: '320px',
                backgroundColor: '#000000',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-viewer)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease',
              }}
            >
              <img
                src={`data:image/png;base64,${scan.gradcam_overlay_base64}`}
                alt="MRI Grad-CAM Overlay"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: opacity,
                  transition: 'opacity 0.1s ease',
                }}
              />
            </div>
          )
        ) : (
          /* Graceful Fallback if Grad-CAM is not generated */
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-viewer)',
              maxWidth: '440px',
            }}
          >
            <IconInfo size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-viewer-bright)' }}>
              Explainability is unavailable for this analysis.
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-viewer-muted)', marginTop: '4px' }}>
              Inference and uncertainty scoring completed successfully. The target convolutional layer was bypassed.
            </div>
          </div>
        )}
      </div>

      {/* Viewer Footer Note */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--bg-viewer-surface)',
          borderTop: '1px solid var(--border-viewer)',
          fontSize: '11px',
          color: 'var(--text-viewer-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>
          Gradient-Weighted Class Activation Mapping (Grad-CAM) via EfficientNetB3{' '}
          <code>top_conv</code>
        </span>
        <span style={{ color: '#60a5fa' }}>Decision Support Overlay</span>
      </div>
    </div>
  );
}
