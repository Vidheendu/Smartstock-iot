import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertOctagon,
  XCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { STOCK_STATUS_CONFIG } from '../../utils/productConstants.js';

export const ProductAttentionTable = ({ attentionProducts = [] }) => {
  const hasItems = attentionProducts && attentionProducts.length > 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return <XCircle className="w-3.5 h-3.5 text-red-600" />;
      case 'CRITICAL':
        return <AlertOctagon className="w-3.5 h-3.5 text-orange-600" />;
      case 'LOW':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D9E2EC] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Products Requiring Attention</h3>
            <p className="text-[11px] text-[#64748B]">
              Items operating at depleted, critical, or low stock levels
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-md self-start sm:self-auto border ${
            hasItems
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {attentionProducts.length} Item{attentionProducts.length !== 1 ? 's' : ''} Flagged
        </span>
      </div>

      {!hasItems ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-emerald-200 bg-emerald-50/40 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-emerald-900">
            All inventory levels are healthy
          </p>
          <p className="text-[11px] text-emerald-700 max-w-sm">
            Every registered product in the catalog is currently stocked above its minimum safety threshold.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#64748B] font-bold uppercase text-[10px] tracking-wider bg-slate-50/70">
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-3 text-right">Minimum Stock</th>
                <th className="py-2.5 px-3 text-right">Deficit</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attentionProducts.map((p) => {
                const config = STOCK_STATUS_CONFIG[p.stockStatus] || STOCK_STATUS_CONFIG.NORMAL;
                const deficit = Math.max(0, p.minimumStock - p.currentStock);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#0F172A]">{p.name}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{p.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-medium">{p.category}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[#0F172A]">
                      {p.currentStock} <span className="font-normal text-[10px] text-[#64748B]">{p.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#64748B]">
                      {p.minimumStock} <span className="font-normal text-[10px] text-[#64748B]">{p.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-600">
                      -{deficit} {p.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}
                      >
                        {getStatusIcon(p.stockStatus)}
                        {config.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Link
                        to={`/products/${p.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769C2] hover:text-[#1257A0] transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductAttentionTable;
