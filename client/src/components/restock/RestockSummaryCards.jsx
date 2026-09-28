import React from 'react';
import { Clock, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RestockSummaryCards({ summary, loading, onCardClick, selectedFilter }) {
  const cards = [
    {
      id: 'PENDING',
      title: 'Pending Orders',
      value: summary?.pendingOrders ?? 0,
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-600',
      subtitle: 'Drafts awaiting dispatch'
    },
    {
      id: 'ORDERED',
      title: 'Ordered',
      value: summary?.orderedOrders ?? 0,
      icon: Truck,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-[#1769C2]',
      iconColor: 'text-[#1769C2]',
      subtitle: 'En route from vendors'
    },
    {
      id: 'RECEIVED',
      title: 'Received',
      value: summary?.receivedOrders ?? 0,
      icon: CheckCircle2,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      subtitle: 'Restocked into catalog'
    },
    {
      id: 'NEEDING_RESTOCK',
      title: 'Products Needing Restock',
      value: summary?.productsNeedingRestock ?? 0,
      icon: AlertTriangle,
      color: 'rose',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-700',
      iconColor: 'text-rose-600',
      subtitle: 'Below safety threshold'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedFilter === c.id;

        return (
          <div
            key={c.id}
            onClick={() => onCardClick && onCardClick(c.id)}
            className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              isSelected ? `${c.borderColor} ring-2 ring-offset-1 ring-blue-400` : 'border-[#D9E2EC]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`w-9 h-9 rounded-xl ${c.bgColor} ${c.borderColor} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-md" />
              ) : (
                <span className={`text-2xl font-extrabold ${c.textColor}`}>
                  {c.value.toLocaleString()}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-[#64748B] font-medium">
              {c.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
