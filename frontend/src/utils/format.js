/**
 * NEUROSIGHT AI - Safe Formatting Utilities
 * Null-safe, type-safe formatters that prevent runtime crashes on unexpected API values.
 */

export function safePercent(val, decimals = 1) {
  if (val === null || val === undefined) return '—';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '—';
  return `${(num <= 1 && num >= 0 ? num * 100 : num).toFixed(decimals)}%`;
}

export function safeFloat(val, decimals = 4, fallback = '—') {
  if (val === null || val === undefined) return fallback;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return String(val || fallback);
  return num.toFixed(decimals);
}

export function safeString(val, fallback = '—') {
  if (val === null || val === undefined) return fallback;
  return String(val).trim() || fallback;
}

export function safeUpper(val, fallback = '—') {
  if (val === null || val === undefined) return fallback;
  return String(val).trim().toUpperCase() || fallback;
}
