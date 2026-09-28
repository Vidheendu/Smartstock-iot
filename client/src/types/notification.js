/**
 * Frontend Notification Types and UI configuration
 */

export const NOTIFICATION_TYPES = Object.freeze({
  LOW_STOCK: 'LOW_STOCK',
  CRITICAL_STOCK: 'CRITICAL_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  SYSTEM: 'SYSTEM'
});

export const NOTIFICATION_CONFIG = Object.freeze({
  LOW_STOCK: {
    label: 'Low Stock',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    borderClass: 'border-l-amber-500'
  },
  CRITICAL_STOCK: {
    label: 'Critical Stock',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    borderClass: 'border-l-orange-500'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    badgeClass: 'bg-red-50 text-red-800 border-red-300',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    borderClass: 'border-l-red-500'
  },
  SYSTEM: {
    label: 'System',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    borderClass: 'border-l-blue-500'
  }
});
