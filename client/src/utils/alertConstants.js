/**
 * SmartStock Alert Constants & UI Configuration
 */
import {
  TriangleAlert,
  AlertCircle,
  PackageX,
  Radio,
  Sliders,
  Cpu
} from 'lucide-react';

export const ALERT_SEVERITIES = Object.freeze({
  ALL: 'ALL',
  LOW: 'LOW',
  CRITICAL: 'CRITICAL',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
});

export const ALERT_STATUSES = Object.freeze({
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED'
});

export const ALERT_TYPES = Object.freeze({
  LOW_STOCK: 'LOW_STOCK',
  CRITICAL_STOCK: 'CRITICAL_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
});

export const ALERT_SOURCES = Object.freeze({
  ALL: 'ALL',
  MANUAL: 'MANUAL',
  IOT: 'IOT',
  SYSTEM: 'SYSTEM'
});

export const SEVERITY_CONFIG = {
  LOW: {
    label: 'Low Stock',
    shortLabel: 'Low',
    color: 'amber',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: TriangleAlert,
    barColor: 'bg-amber-500'
  },
  CRITICAL: {
    label: 'Critical Stock',
    shortLabel: 'Critical',
    color: 'orange',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badgeClass: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: AlertCircle,
    barColor: 'bg-orange-500'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    shortLabel: 'Out of Stock',
    color: 'red',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badgeClass: 'text-red-700 bg-red-50 border-red-200',
    icon: PackageX,
    barColor: 'bg-red-500'
  }
};

export const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badgeClass: 'text-red-700 bg-red-50 border-red-200'
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeClass: 'text-[#1769C2] bg-[#E8F2FF] border-[#BFDBFE]'
  },
  RESOLVED: {
    label: 'Resolved',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  }
};

export const SOURCE_CONFIG = {
  MANUAL: {
    label: 'Manual',
    icon: Sliders,
    badgeClass: 'text-slate-700 bg-slate-100 border-slate-200'
  },
  IOT: {
    label: 'IoT Sensor',
    icon: Radio,
    badgeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200'
  },
  SYSTEM: {
    label: 'System',
    icon: Cpu,
    badgeClass: 'text-slate-600 bg-slate-50 border-slate-200'
  }
};

export function formatTimeAgo(dateString) {
  if (!dateString) return 'N/A';
  const delta = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (delta < 5) return 'Just now';
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)} min ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 604800) return `${Math.floor(delta / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function formatFullDateTime(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
