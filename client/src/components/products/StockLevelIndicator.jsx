import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

/**
 * StockLevelIndicator component.
 * Visual representation of Current Stock vs Minimum Stock with a clearly
 * indicated minimum-stock threshold marker on a progress bar.
 */
export const StockLevelIndicator = ({ currentStock = 0, minimumStock = 0, unit = 'units', status = 'NORMAL' }) => {
  const current = Math.max(0, Number(currentStock));
  const min = Math.max(0, Number(minimumStock));

  // Determine a sensible maximum scale for the progress bar
  const maxScale = Math.max(current, min * 2, min + 20, 20);
  const currentPercent = Math.min(100, Math.max(0, (current / maxScale) * 100));
  const minPercent = Math.min(100, Math.max(0, (min / maxScale) * 100));

  // Determine color scheme based on status
  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let StatusIcon = CheckCircle2;

  if (status === 'OUT_OF_STOCK' || current === 0) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    StatusIcon = XCircle;
  } else if (status === 'CRITICAL' || current <= min / 2) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    StatusIcon = AlertCircle;
  } else if (status === 'LOW' || current <= min) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Stock Level vs Minimum Threshold
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
              {current} <span className="text-xs font-semibold text-[#64748B]">{unit}</span>
            </span>
            <span className="text-xs text-[#64748B]">/</span>
            <span className="text-sm font-bold text-[#64748B]">
              Min: {min} {unit}
            </span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${badgeColor}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>
            {current === 0
              ? 'Out of Stock'
              : current <= min
              ? `${min - current} ${unit} below threshold`
              : `${current - min} ${unit} above threshold`}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative pt-6 pb-2">
        {/* Minimum Threshold Marker Label */}
        <div
          className="absolute top-0 text-[10px] font-extrabold text-[#1769C2] -translate-x-1/2 whitespace-nowrap flex flex-col items-center pointer-events-none"
          style={{ left: `${minPercent}%` }}
        >
          <span>Min Threshold: {min} {unit}</span>
          <div className="w-0.5 h-2 bg-[#1769C2] mt-0.5" />
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-visible">
          {/* Filled Progress Bar */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${currentPercent}%` }}
          />

          {/* Vertical Threshold Pin Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#1769C2] -translate-x-1/2 rounded shadow-xs z-10"
            style={{ left: `${minPercent}%` }}
            title={`Minimum Threshold: ${min} ${unit}`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
          <span>0 {unit}</span>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${barColor}`} />
              <span>Current Stock ({current})</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1769C2]" />
              <span>Min Threshold ({min})</span>
            </span>
          </div>
          <span>{maxScale} {unit}</span>
        </div>
      </div>
    </div>
  );
};

export default StockLevelIndicator;
