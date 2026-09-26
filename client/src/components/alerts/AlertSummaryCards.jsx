import React from 'react';
import {
  BellRing,
  AlertCircle,
  TriangleAlert,
  PackageX
} from 'lucide-react';

export const AlertSummaryCards = ({
  summary = {},
  selectedSeverity,
  onSelectSeverity
}) => {
  const cards = [
    {
      id: 'active',
      title: 'Active Alerts',
      count: summary.activeAlerts ?? 0,
      icon: BellRing,
      subtitle: 'Requiring attention',
      borderColor: 'border-red-200',
      bgColor: 'bg-white',
      accentColor: 'text-red-600',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      filterSeverity: 'ALL'
    },
    {
      id: 'critical',
      title: 'Critical Stock',
      count: summary.criticalAlerts ?? 0,
      icon: AlertCircle,
      subtitle: '<= 50% min threshold',
      borderColor: 'border-orange-200',
      bgColor: 'bg-white',
      accentColor: 'text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      filterSeverity: 'CRITICAL'
    },
    {
      id: 'low',
      title: 'Low Stock',
      count: summary.lowStockAlerts ?? 0,
      icon: TriangleAlert,
      subtitle: '<= minimum threshold',
      borderColor: 'border-amber-200',
      bgColor: 'bg-white',
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      filterSeverity: 'LOW'
    },
    {
      id: 'out_of_stock',
      title: 'Out of Stock',
      count: summary.outOfStockAlerts ?? 0,
      icon: PackageX,
      subtitle: 'Zero stock depleted',
      borderColor: 'border-red-200',
      bgColor: 'bg-white',
      accentColor: 'text-red-600',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      filterSeverity: 'OUT_OF_STOCK'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedSeverity === card.filterSeverity;

        return (
          <div
            key={card.id}
            onClick={() => onSelectSeverity && onSelectSeverity(card.filterSeverity)}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${card.bgColor} ${
              isSelected
                ? 'ring-2 ring-[#1769C2] border-[#1769C2]'
                : `${card.borderColor} hover:border-slate-300`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.badgeBg}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {card.count}
              </span>
              <span className="text-[11px] font-semibold text-[#64748B]">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertSummaryCards;
