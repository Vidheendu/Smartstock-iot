import React from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  ArrowLeftRight,
  BellRing,
  RadioTower
} from 'lucide-react';

export const AnalyticsSummaryCards = ({ overview, loading }) => {
  if (loading || !overview) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 bg-white border border-[#D9E2EC] rounded-2xl animate-pulse space-y-2"
          >
            <div className="w-7 h-7 bg-slate-100 rounded-lg" />
            <div className="w-12 h-6 bg-slate-100 rounded" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Products',
      value: overview.totalProducts ?? 0,
      icon: Package,
      badge: 'Catalog',
      color: 'text-[#1769C2] bg-[#E8F2FF] border-[#BFDBFE]'
    },
    {
      label: 'Current Stock',
      value: overview.totalCurrentStock ?? 0,
      unit: 'units',
      icon: Boxes,
      badge: 'Live',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Low Stock',
      value: overview.lowStockProducts ?? 0,
      icon: AlertTriangle,
      badge: 'Warning',
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      label: 'Critical Stock',
      value: overview.criticalStockProducts ?? 0,
      icon: AlertOctagon,
      badge: 'Urgent',
      color: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    {
      label: 'Out of Stock',
      value: overview.outOfStockProducts ?? 0,
      icon: XCircle,
      badge: 'Depleted',
      color: 'text-red-700 bg-red-50 border-red-200'
    },
    {
      label: 'Transactions',
      value: overview.inventoryTransactions ?? 0,
      icon: ArrowLeftRight,
      badge: 'History',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    {
      label: 'Active Alerts',
      value: overview.activeAlerts ?? 0,
      icon: BellRing,
      badge: 'Action Req.',
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    {
      label: 'IoT Readings',
      value: overview.iotReadings ?? 0,
      icon: RadioTower,
      badge: 'Simulated',
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="p-3.5 bg-white border border-[#D9E2EC] rounded-2xl flex flex-col justify-between shadow-xs hover:border-[#1769C2]/30 transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl border ${card.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${card.color}`}>
                {card.badge}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                {card.value.toLocaleString()}
                {card.unit && (
                  <span className="text-xs font-normal text-[#64748B] ml-1">
                    {card.unit}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-[#64748B] truncate mt-0.5">
                {card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsSummaryCards;
