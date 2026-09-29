import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Radio,
  Clock,
  PackageCheck,
  Ban,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

const STATUS_PRESETS = {
  // Inventory Statuses
  NORMAL: {
    label: 'Normal',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-500'
  },
  LOW: {
    label: 'Low Stock',
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: AlertTriangle,
    dotColor: 'bg-amber-500'
  },
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-orange-50 text-orange-800 border-orange-300',
    icon: AlertCircle,
    dotColor: 'bg-orange-500'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    bg: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: XCircle,
    dotColor: 'bg-rose-500'
  },

  // IoT Statuses
  ONLINE: {
    label: 'Online',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: Radio,
    dotColor: 'bg-emerald-500 animate-pulse'
  },
  OFFLINE: {
    label: 'Offline',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Ban,
    dotColor: 'bg-slate-400'
  },

  // Restock Statuses
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    dotColor: 'bg-slate-400'
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: Clock,
    dotColor: 'bg-amber-500'
  },
  ORDERED: {
    label: 'Ordered',
    bg: 'bg-blue-50 text-[#1769C2] border-blue-300',
    icon: Clock,
    dotColor: 'bg-[#1769C2]'
  },
  RECEIVED: {
    label: 'Received',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: PackageCheck,
    dotColor: 'bg-emerald-500'
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    dotColor: 'bg-rose-400'
  },

  // Supplier Statuses
  ACTIVE: {
    label: 'Active',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: ShieldCheck,
    dotColor: 'bg-emerald-500'
  },
  INACTIVE: {
    label: 'Inactive',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Ban,
    dotColor: 'bg-slate-400'
  },

  // Alert Severities
  HIGH: {
    label: 'Critical',
    bg: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: AlertCircle,
    dotColor: 'bg-rose-500'
  },

  // Forecast Statuses
  STABLE: {
    label: 'Stable',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-500'
  },
  ATTENTION: {
    label: 'Attention',
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: AlertTriangle,
    dotColor: 'bg-amber-500'
  },
  URGENT: {
    label: 'Urgent',
    bg: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: AlertCircle,
    dotColor: 'bg-rose-500'
  },
  NO_DATA: {
    label: 'No Data',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: TrendingDown,
    dotColor: 'bg-slate-400'
  }
};

export const Badge = ({
  status = 'NORMAL',
  customLabel,
  size = 'sm', // 'sm' | 'md'
  showDot = true,
  className = ''
}) => {
  const normalized = String(status).toUpperCase().replace(/\s+/g, '_');
  const config = STATUS_PRESETS[normalized] || STATUS_PRESETS.NORMAL;
  const label = customLabel || config.label;
  const isPulse = normalized === 'CRITICAL' || normalized === 'OUT_OF_STOCK' || normalized === 'ONLINE';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border tracking-wide uppercase ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      } ${config.bg} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor} ${
            isPulse ? 'animate-pulse' : ''
          }`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export default Badge;
