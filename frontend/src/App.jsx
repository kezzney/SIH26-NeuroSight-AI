import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { api } from './services/api';

// Components
import { Header } from './components/layout/Header';
import { MetricsSummary } from './components/layout/MetricsSummary';
import { WorklistFilters } from './components/worklist/WorklistFilters';
import { WorklistTable } from './components/worklist/WorklistTable';
import { UploadZone } from './components/upload/UploadZone';
import { SampleCasesSelector } from './components/upload/SampleCasesSelector';
import { ImageViewer } from './components/analysis/ImageViewer';
import { ClassificationCard } from './components/analysis/ClassificationCard';
import { ProbabilityBars } from './components/analysis/ProbabilityBars';
import { UncertaintyCard } from './components/analysis/UncertaintyCard';
import { ExplainabilityNotice } from './components/analysis/ExplainabilityNotice';
import { StructuredPreRead } from './components/reporting/StructuredPreRead';
import { RadiologistReview } from './components/reporting/RadiologistReview';
import { PrintReport } from './components/reporting/PrintReport';
import { ModelInsights } from './components/insights/ModelInsights';
import { SystemDiagnostics } from './components/settings/SystemDiagnostics';
import { Toast } from './components/common/Toast';
import { IconPrinter, IconBrain, IconUpload } from './components/common/Icons';

const PRIORITY_ORDER = {
  low_confidence: 0,
  moderate_confidence: 1,
  high_confidence: 2,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('command-center');
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Worklist Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterBucket, setFilterBucket] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  // Fetch Worklist
  const refreshWorklist = useCallback(async () => {
    try {
      const list = await api.listScans();
      setScans(list || []);
      if (!selectedScanId && list && list.length > 0) {
        setSelectedScanId(list[0].id);
      }
    } catch {
      // Backend may be offline during startup — handled gracefully
    }
  }, [selectedScanId]);

  // Fetch System Health
  const checkSystemHealth = useCallback(async () => {
    setIsRefreshingHealth(true);
    try {
      const health = await api.checkHealth();
      setSystemHealth(health);
    } catch (err) {
      setSystemHealth({ status: 'offline', model_loaded: false, error: err.message });
    } finally {
      setIsRefreshingHealth(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    checkSystemHealth();
    refreshWorklist();

    // Periodic lightweight health check
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [checkSystemHealth, refreshWorklist]);

  // Load Single Scan Detail when selectedScanId changes
  useEffect(() => {
    if (!selectedScanId) {
      setSelectedScan(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);
    api
      .getScan(selectedScanId)
      .then((data) => {
        if (isMounted) setSelectedScan(data);
      })
      .catch((err) => {
        if (isMounted) {
          setToast({ type: 'error', message: `Failed to load scan details: ${err.message}` });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedScanId]);

  // Handle Upload Scan
  async function handleUpload(file, patientRef) {
    setIsUploading(true);
    try {
      const result = await api.uploadScan(file, patientRef);
      setToast({
        type: 'success',
        message: `MRI Analysis completed for ${result.patient_ref || 'Case'}.`,
      });
      await refreshWorklist();
      setSelectedScanId(result.id);
      setSelectedScan(result);
      setActiveTab('analysis');
    } catch (err) {
      setToast({
        type: 'error',
        message: `Upload analysis failed: ${err.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  }

  // Handle Save Review
  async function handleSaveReview(scanId, updateData) {
    setIsSaving(true);
    try {
      const updated = await api.updateScan(scanId, updateData);
      setSelectedScan(updated);
      await refreshWorklist();
      setToast({
        type: 'success',
        message: `Case ${updated.patient_ref || ''} successfully saved with status: ${updated.status}.`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `Failed to save review: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Worklist Row Selection
  function handleSelectScan(scanId) {
    setSelectedScanId(scanId);
    setActiveTab('analysis');
  }

  // Reset Filters
  function handleResetFilters() {
    setSearchQuery('');
    setFilterClass('all');
    setFilterBucket('all');
    setFilterStatus('all');
    setSortBy('priority');
  }

  // Filter & Sort Worklist Scans
  const filteredScans = useMemo(() => {
    return scans
      .filter((scan) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchRef = (scan.patient_ref || '').toLowerCase().includes(q);
          const matchId = (scan.id || '').toLowerCase().includes(q);
          const matchClass = (scan.predicted_class || '').toLowerCase().includes(q);
          if (!matchRef && !matchId && !matchClass) return false;
        }

        // Filter Class
        if (filterClass !== 'all' && scan.predicted_class?.toLowerCase() !== filterClass.toLowerCase()) {
          return false;
        }

        // Filter Bucket
        if (filterBucket !== 'all' && scan.triage_bucket !== filterBucket) {
          return false;
        }

        // Filter Status
        if (filterStatus !== 'all' && (scan.status || 'pending').toLowerCase() !== filterStatus.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const pA = PRIORITY_ORDER[a.triage_bucket] ?? 1;
          const pB = PRIORITY_ORDER[b.triage_bucket] ?? 1;
          if (pA !== pB) return pA - pB;
          return new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.uploaded_at || 0) - new Date(b.uploaded_at || 0);
        }
        if (sortBy === 'highest_conf') {
          return (b.confidence || 0) - (a.confidence || 0);
        }
        if (sortBy === 'lowest_conf') {
          return (a.confidence || 0) - (b.confidence || 0);
        }
        if (sortBy === 'highest_entropy') {
          return (b.uncertainty?.normalized_entropy || 0) - (a.uncertainty?.normalized_entropy || 0);
        }
        return 0;
      });
  }, [scans, searchQuery, filterClass, filterBucket, filterStatus, sortBy]);

  const pendingCount = scans.filter((s) => (s.status || 'pending').toLowerCase() === 'pending').length;

  return (
    <div className="app-container">
      {/* Clinical PACS Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalScansCount={scans.length}
        pendingCount={pendingCount}
        systemHealth={systemHealth}
        onRefreshHealth={checkSystemHealth}
        isRefreshing={isRefreshingHealth}
      />

      {/* Main Viewport Content */}
      <main className="main-content fade-in">
        {/* TAB 1: Command Center */}
        {activeTab === 'command-center' && (
          <MetricsSummary
            scans={scans}
            onSelectScan={handleSelectScan}
            onNewScanClick={() => setActiveTab('new-scan')}
          />
        )}

        {/* TAB 2: Worklist */}
        {activeTab === 'worklist' && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Radiology Triage Worklist
                </h2>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  Prioritized pre-read queue sorted by predictive uncertainty
                </span>
              </div>
              <button
                onClick={() => setActiveTab('new-scan')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <IconUpload size={14} />
                <span>Add Scan</span>
              </button>
            </div>

            <WorklistFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterClass={filterClass}
              onFilterClassChange={setFilterClass}
              filterBucket={filterBucket}
              onFilterBucketChange={setFilterBucket}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onResetFilters={handleResetFilters}
            />

            <WorklistTable
              scans={filteredScans}
              selectedScanId={selectedScanId}
              onSelectScan={handleSelectScan}
              onNewScanClick={() => setActiveTab('new-scan')}
            />
          </div>
        )}

        {/* TAB 3: New Scan (Upload + Demo Mode) */}
        {activeTab === 'new-scan' && (
          <div className="upload-layout">
            <UploadZone onUpload={handleUpload} isUploading={isUploading} />
            <SampleCasesSelector onSelectSample={handleUpload} isUploading={isUploading} />
          </div>
        )}

        {/* TAB 4: Scan Analysis Workstation */}
        {activeTab === 'analysis' && (
          <div>
            {isLoadingDetail ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  padding: '60px 24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Loading Case Analysis & Grad-CAM Overlay…
                </div>
              </div>
            ) : selectedScan ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Case Action Header Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-surface)',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <IconBrain size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {selectedScan.patient_ref || 'Unlabeled Case'}
                        </h2>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          [{selectedScan.id.slice(0, 8)}]
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Uploaded:{' '}
                        {selectedScan.uploaded_at ? new Date(selectedScan.uploaded_at).toLocaleString() : '—'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setShowPrintModal(true)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <IconPrinter size={15} />
                      <span>Print / Export Report</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('worklist')}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-sm)',
                      }}
                    >
                      Back to Worklist
                    </button>
                  </div>
                </div>

                {/* Two-Column Clinical Inspection Workspace */}
                <div className="analysis-layout">
                  {/* Left Column: PACS Image Viewer & Responsible AI Notice */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ImageViewer scan={selectedScan} />
                    <ExplainabilityNotice />
                    <StructuredPreRead scan={selectedScan} />
                  </div>

                  {/* Right Column: Classification, Probabilities, Reliability & Radiologist Sign-off */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ClassificationCard scan={selectedScan} />
                    <ProbabilityBars
                      probabilities={selectedScan.class_probabilities}
                      predictedClass={selectedScan.predicted_class}
                    />
                    <UncertaintyCard
                      uncertainty={selectedScan.uncertainty}
                      confidence={selectedScan.confidence}
                    />
                    <RadiologistReview
                      scan={selectedScan}
                      onSaveReview={handleSaveReview}
                      isSaving={isSaving}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  padding: '60px 24px',
                  textAlign: 'center',
                }}
              >
                <IconBrain size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  No case currently selected
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-base)', marginBottom: '18px' }}>
                  Select an analyzed MRI case from the worklist or upload a new scan to view the complete workstation analysis.
                </p>
                <button
                  onClick={() => setActiveTab('worklist')}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: 'var(--font-sm)',
                  }}
                >
                  Open Worklist
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Model Insights */}
        {activeTab === 'insights' && <ModelInsights />}

        {/* TAB 6: Diagnostics */}
        {activeTab === 'settings' && (
          <SystemDiagnostics
            systemHealth={systemHealth}
            onRefreshHealth={checkSystemHealth}
            isRefreshing={isRefreshingHealth}
          />
        )}
      </main>

      {/* Print Preview & PDF Export Modal */}
      {showPrintModal && selectedScan && (
        <PrintReport scan={selectedScan} onClose={() => setShowPrintModal(false)} />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
