/**
 * Restocking Constants, Visual Configurations, and Display Helpers
 */

export const RESTOCK_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ORDERED: 'ORDERED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
});

export const RESTOCK_STATUS_CONFIG = Object.freeze({
  [RESTOCK_STATUS.PENDING]: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    description: 'Awaiting supplier confirmation & transmission'
  },
  [RESTOCK_STATUS.ORDERED]: {
    label: 'Ordered',
    badgeClass: 'bg-blue-50 text-[#1769C2] border-[#BFDBFE]',
    dotClass: 'bg-[#1769C2]',
    description: 'Order placed with vendor, awaiting delivery'
  },
  [RESTOCK_STATUS.RECEIVED]: {
    label: 'Received',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    description: 'Inventory received and added to stock'
  },
  [RESTOCK_STATUS.CANCELLED]: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
    description: 'Order cancelled prior to receiving'
  }
});

/**
 * Format currency with 2 decimal places.
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format human-readable date.
 */
export function formatRestockDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

/**
 * Format full date with time.
 */
export function formatRestockDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}
