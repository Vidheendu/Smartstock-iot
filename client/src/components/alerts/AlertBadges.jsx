import React from 'react';
import {
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  SOURCE_CONFIG
} from '../../utils/alertConstants.js';
import { TriangleAlert, AlertCircle, PackageX, Radio, Sliders, Cpu } from 'lucide-react';

export const AlertSeverityBadge = ({ severity, size = 'sm' }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;
  const Icon = config.icon || TriangleAlert;

  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs gap-1.5'
      : 'px-2.5 py-1 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border ${config.badgeClass} ${sizeClasses}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
};

export const AlertStatusBadge = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;

  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs'
      : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center font-extrabold uppercase tracking-wide rounded-md border ${config.badgeClass} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'ACTIVE'
            ? 'bg-red-500 animate-pulse'
            : status === 'ACKNOWLEDGED'
            ? 'bg-[#1769C2]'
            : 'bg-emerald-500'
        }`}
      />
      {config.label}
    </span>
  );
};

export const AlertSourceBadge = ({ source }) => {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.SYSTEM;
  const Icon = config.icon || Cpu;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${config.badgeClass}`}
      title={`Source: ${config.label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default {
  AlertSeverityBadge,
  AlertStatusBadge,
  AlertSourceBadge
};
