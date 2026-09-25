import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle, Info } from 'lucide-react';

export const StockStatusCard = ({ summary }) => {
  const {
    normal = 0,
    low = 0,
    critical = 0,
    outOfStock = 0,
    total = 0
  } = summary || {};

  const totalCalculated = total || (normal + low + critical + outOfStock) || 1;

  const normalPct = Math.round((normal / totalCalculated) * 100);
  const lowPct = Math.round((low / totalCalculated) * 100);
  const criticalPct = Math.round((critical / totalCalculated) * 100);
  const oosPct = Math.round((outOfStock / totalCalculated) * 100);

  const statuses = [
    {
      id: 'normal',
      label: 'Normal',
      count: normal,
      percentage: normalPct,
      threshold: 'current stock > minimum stock',
      icon: CheckCircle2,
      color: 'emerald',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      barColor: 'bg-emerald-500'
    },
    {
      id: 'low',
      label: 'Low',
      count: low,
      percentage: lowPct,
      threshold: 'current stock <= minimum stock',
      icon: AlertTriangle,
      color: 'amber',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      barColor: 'bg-amber-500'
    },
    {
      id: 'critical',
      label: 'Critical',
      count: critical,
      percentage: criticalPct,
      threshold: 'current stock <= 50% minimum stock and > 0',
      icon: AlertOctagon,
      color: 'orange',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      barColor: 'bg-orange-500'
    },
    {
      id: 'outOfStock',
      label: 'Out of Stock',
      count: outOfStock,
      percentage: oosPct,
      threshold: 'current stock = 0',
      icon: XCircle,
      color: 'red',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      barColor: 'bg-red-500'
    }
  ];

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Stock Status Overview</h2>
          <p className="text-xs text-slate-400">
            Current catalog distribution across defined stock thresholds.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Total: <strong className="text-white">{totalCalculated}</strong> products</span>
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-900/80 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-700/50">
          {normalPct > 0 && (
            <div
              style={{ width: `${normalPct}%` }}
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
              title={`Normal: ${normal} (${normalPct}%)`}
            />
          )}
          {lowPct > 0 && (
            <div
              style={{ width: `${lowPct}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Low: ${low} (${lowPct}%)`}
            />
          )}
          {criticalPct > 0 && (
            <div
              style={{ width: `${criticalPct}%` }}
              className="bg-orange-500 h-full transition-all duration-500"
              title={`Critical: ${critical} (${criticalPct}%)`}
            />
          )}
          {oosPct > 0 && (
            <div
              style={{ width: `${oosPct}%` }}
              className="bg-red-500 h-full rounded-r-full transition-all duration-500"
              title={`Out of Stock: ${outOfStock} (${oosPct}%)`}
            />
          )}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
          <span className="text-emerald-400">{normalPct}% Normal</span>
          <span className="text-amber-400">{lowPct}% Low</span>
          <span className="text-orange-400">{criticalPct}% Critical</span>
          <span className="text-red-400">{oosPct}% Out of Stock</span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statuses.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${item.borderColor} ${item.bgColor} flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${item.textColor}`}>
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.textColor}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{item.count}</span>
                <span className="text-xs text-slate-400">items</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {item.threshold}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockStatusCard;
