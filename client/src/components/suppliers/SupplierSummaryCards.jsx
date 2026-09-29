import React from 'react';
import { Truck, CheckCircle2, AlertOctagon, ShoppingBag, Loader2 } from 'lucide-react';

export default function SupplierSummaryCards({
  summary,
  loading = false,
  selectedStatus = 'ALL',
  hasActiveOrdersFilter = false,
  onCardClick
}) {
  const cards = [
    {
      id: 'TOTAL',
      title: 'Total Suppliers',
      value: summary?.totalSuppliers ?? 0,
      icon: Truck,
      color: 'text-[#1769C2]',
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      activeFilter: selectedStatus === 'ALL' && !hasActiveOrdersFilter,
      description: 'All registered suppliers in the system'
    },
    {
      id: 'ACTIVE',
      title: 'Active Suppliers',
      value: summary?.activeSuppliers ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      activeFilter: selectedStatus === 'ACTIVE',
      description: 'Available for purchase orders & catalog'
    },
    {
      id: 'INACTIVE',
      title: 'Inactive Suppliers',
      value: summary?.inactiveSuppliers ?? 0,
      icon: AlertOctagon,
      color: 'text-slate-500',
      bg: 'bg-slate-100/70',
      border: 'border-slate-200',
      activeFilter: selectedStatus === 'INACTIVE',
      description: 'Deactivated but historical links preserved'
    },
    {
      id: 'ACTIVE_ORDERS',
      title: 'Suppliers with Active Orders',
      value: summary?.suppliersWithActiveOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      activeFilter: Boolean(hasActiveOrdersFilter),
      description: 'Suppliers with pending or transit orders'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = card.activeFilter;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`text-left p-4.5 rounded-2xl bg-white border transition-all duration-200 shadow-xs cursor-pointer relative overflow-hidden ${
              isSelected
                ? 'border-[#1769C2] ring-2 ring-[#1769C2]/20 shadow-md'
                : 'border-[#D9E2EC] hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.border} border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#64748B] my-1" />
              ) : (
                <span className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  {card.value}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#64748B] mt-1 truncate">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
