import React from 'react';
import {
  PackageCheck,
  HelpCircle,
  ClockAlert,
  TrendingDown
} from 'lucide-react';

export const ForecastSummaryCards = ({ summary, periodDays = 30, loading = false }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 bg-white border border-[#D9E2EC] rounded-2xl animate-pulse space-y-2.5"
          >
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
            <div className="w-16 h-7 bg-slate-100 rounded" />
            <div className="w-24 h-3 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Products with Forecast',
      value: summary.productsWithForecast ?? 0,
      icon: PackageCheck,
      badge: 'Active Forecasts',
      subtitle: `Calculated from ${periodDays}-day stock-out data`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      label: 'No Consumption History',
      value: summary.productsNoData ?? 0,
      icon: HelpCircle,
      badge: 'Insufficient Data',
      subtitle: 'Stock on hand without stock-out records',
      color: 'text-slate-600 bg-slate-50 border-slate-200'
    },
    {
      label: 'Running Out Soon',
      value: summary.productsRunningOutSoon ?? 0,
      icon: ClockAlert,
      badge: 'Urgent / Attention',
      subtitle: 'Estimated depletion within 14 days',
      color: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    {
      label: 'Avg. Consumption Rate',
      value: summary.averageStoreConsumptionRate ?? 0,
      unit: 'units/day',
      icon: TrendingDown,
      badge: `Last ${periodDays}d Mean`,
      subtitle: 'Storewide daily consumption velocity',
      color: 'text-[#1769C2] bg-[#E8F2FF] border-[#BFDBFE]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 bg-white border border-[#D9E2EC] rounded-2xl flex flex-col justify-between shadow-xs hover:border-[#1769C2]/30 transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl border ${card.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.color}`}>
                {card.badge}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                {card.value.toLocaleString()}
                {card.unit && (
                  <span className="text-xs font-normal text-[#64748B] ml-1">
                    {card.unit}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-[#0F172A] mt-0.5">
                {card.label}
              </p>
              <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ForecastSummaryCards;
