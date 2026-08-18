import React from 'react';
import { IconSearch, IconArrowUpDown, IconRotateCcw } from '../common/Icons';

export function WorklistFilters({
  searchQuery,
  onSearchChange,
  filterClass,
  onFilterClassChange,
  filterBucket,
  onFilterBucketChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  onResetFilters,
}) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filterClass !== 'all' ||
    filterBucket !== 'all' ||
    filterStatus !== 'all' ||
    sortBy !== 'priority';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px',
      }}
    >
      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          flex: '1 1 240px',
          maxWidth: '360px',
        }}
      >
        <IconSearch size={15} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search patient ref, case ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            fontSize: 'var(--font-sm)',
            color: 'var(--text-primary)',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '0 4px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Controls Group */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        {/* Triage Bucket Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            TRIAGE:
          </label>
          <select
            value={filterBucket}
            onChange={(e) => onFilterBucketChange(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 'var(--font-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Triage Buckets</option>
            <option value="low_confidence">Priority Review Only</option>
            <option value="moderate_confidence">Standard Review</option>
            <option value="high_confidence">Standard Queue</option>
          </select>
        </div>

        {/* Prediction Class Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            CLASS:
          </label>
          <select
            value={filterClass}
            onChange={(e) => onFilterClassChange(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 'var(--font-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Classes</option>
            <option value="glioma">Glioma</option>
            <option value="meningioma">Meningioma</option>
            <option value="notumor">No Tumor</option>
            <option value="pituitary">Pituitary</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            STATUS:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 'var(--font-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved & Signed</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            SORT:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 'var(--font-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="priority">Priority First (Uncertainty)</option>
            <option value="newest">Newest Uploads</option>
            <option value="oldest">Oldest Uploads</option>
            <option value="highest_conf">Highest Confidence</option>
            <option value="lowest_conf">Lowest Confidence</option>
            <option value="highest_entropy">Highest Entropy</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              fontSize: 'var(--font-xs)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-secondary)',
            }}
            title="Reset filters to default"
          >
            <IconRotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
