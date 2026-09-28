/**
 * SmartStock Forecasting Constants & UI Configuration
 * 
 * Distinct from inventory stock status (NORMAL, LOW, CRITICAL, OUT_OF_STOCK).
 * Forecast statuses:
 * - STABLE: Estimated days remaining >= 14
 * - ATTENTION: Estimated days remaining 7 - 13.9
 * - URGENT: Estimated days remaining < 7
 * - OUT_OF_STOCK: Current stock is 0
 * - NO_DATA: Insufficient consumption history to calculate rate
 */

import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const FORECAST_PERIODS = [
  { id: 7, label: 'Last 7 Days', shortLabel: '7d' },
  { id: 30, label: 'Last 30 Days', shortLabel: '30d' },
  { id: 90, label: 'Last 90 Days', shortLabel: '90d' }
];

export const DEFAULT_FORECAST_PERIOD = 30;

export const FORECAST_STATUS_CONFIG = {
  STABLE: {
    label: 'Stable',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
    description: 'Estimated stock >= 14 days'
  },
  ATTENTION: {
    label: 'Attention',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    description: 'Estimated stock 7 - 13 days'
  },
  URGENT: {
    label: 'Urgent',
    badgeClass: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: AlertOctagon,
    description: 'Estimated depletion < 7 days'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    badgeClass: 'text-red-700 bg-red-50 border-red-200',
    icon: XCircle,
    description: 'Current stock is 0'
  },
  NO_DATA: {
    label: 'No Data',
    badgeClass: 'text-slate-600 bg-slate-100 border-slate-200',
    icon: HelpCircle,
    description: 'Insufficient consumption data'
  }
};

export function formatDaysRemaining(days) {
  if (days === null || days === undefined) {
    return 'No data';
  }
  if (days === 0) {
    return '0 days';
  }
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function formatADC(adc, unit = 'units') {
  if (adc === null || adc === undefined || adc === 0) {
    return `0 ${unit}/day`;
  }
  return `${adc} ${unit}/day`;
}

export function formatDepletionDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';

  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
