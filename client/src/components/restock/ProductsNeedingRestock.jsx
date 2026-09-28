import React, { useState } from 'react';
import { AlertTriangle, Plus, ChevronDown, ChevronUp, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function ProductsNeedingRestock({ products = [], loading, onRestockProduct, isManager }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-6 shadow-xs animate-pulse">
        <div className="h-6 w-48 bg-slate-100 rounded mb-4" />
        <div className="h-32 bg-slate-50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-xs overflow-hidden">
      {/* Header with Accordion Toggle */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b border-[#D9E2EC] bg-[#F8FAFC] cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0F172A]">Products Needing Restock</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {products.length}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Deterministic replenishment recommendations based on minimum threshold and consumption forecast
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg hover:bg-slate-200 text-[#64748B] transition-colors"
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Table */}
      {isExpanded && (
        <div>
          {products.length === 0 ? (
            <div className="py-10 px-6 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#0F172A]">All monitored products currently have sufficient stock</h4>
              <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                No active SKUs have dropped below safety thresholds or have immediate projected stockout dates.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D9E2EC] bg-slate-50 text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Min. Stock</th>
                    <th className="py-3 px-4">Daily Consumption</th>
                    <th className="py-3 px-4">Runway</th>
                    <th className="py-3 px-4">Suggested Restock</th>
                    <th className="py-3 px-4">Supplier</th>
                    {isManager && <th className="py-3 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                  {products.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0F172A]">{item.name}</div>
                        <div className="text-[11px] text-[#64748B]">{item.category}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#475569]">{item.sku}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${item.currentStock === 0 ? 'text-rose-600' : item.currentStock <= item.minimumStock ? 'text-amber-600' : 'text-[#0F172A]'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">{item.minimumStock} {item.unit}</td>
                      <td className="py-3 px-4 text-[#475569]">
                        {item.averageDailyConsumption > 0 ? `${item.averageDailyConsumption} ${item.unit}/day` : 'No data'}
                      </td>
                      <td className="py-3 px-4">
                        {item.estimatedDaysRemaining !== null ? (
                          <span className={`font-bold ${item.estimatedDaysRemaining < 7 ? 'text-rose-600' : 'text-amber-600'}`}>
                            {item.estimatedDaysRemaining} days
                          </span>
                        ) : (
                          <span className="text-[#64748B]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
                          Suggested: {item.suggestedQuantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#475569]">{item.supplierName || 'Unassigned'}</td>
                      {isManager && (
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onRestockProduct && onRestockProduct(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] shadow-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add to Restock
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
