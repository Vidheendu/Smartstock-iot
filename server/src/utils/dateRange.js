/**
 * Date Range & Time-Window Utilities for Analytics
 * 
 * Supports:
 * - 'today' / '1d': Beginning of today (or last 24h)
 * - '7d': Last 7 days
 * - '30d': Last 30 days (default)
 * - '90d': Last 90 days
 */

export const SUPPORTED_RANGES = Object.freeze(['today', '1d', '7d', '30d', '90d']);
export const DEFAULT_RANGE = '30d';

/**
 * Validates and normalizes range query parameter.
 * Throws 400 error if range is unsupported.
 * 
 * @param {string} rangeQuery 
 * @returns {string} Normalized range string ('today', '7d', '30d', '90d')
 */
export function parseRange(rangeQuery) {
  if (!rangeQuery) {
    return DEFAULT_RANGE;
  }

  const normalized = String(rangeQuery).trim().toLowerCase();

  if (!SUPPORTED_RANGES.includes(normalized)) {
    const error = new Error(`Invalid time range '${rangeQuery}'. Supported ranges: today, 7d, 30d, 90d.`);
    error.status = 400;
    throw error;
  }

  // Normalize '1d' to 'today' for internal consistency
  return normalized === '1d' ? 'today' : normalized;
}

/**
 * Calculates start timestamp for a given time range.
 * 
 * @param {string} range - 'today', '7d', '30d', '90d'
 * @returns {Date}
 */
export function getRangeStartDate(range) {
  const now = new Date();

  switch (range) {
    case 'today':
    case '1d': {
      // Beginning of today (00:00:00.000) or last 24 hours
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Formats a Date object or ISO string to 'YYYY-MM-DD'
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDateKey(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Formats a Date object or ISO string to short human-readable format, e.g. "Sep 28"
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDisplayDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
