import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ExternalLink, ArrowRight } from 'lucide-react';
import ProductStatusBadge from '../products/ProductStatusBadge.jsx';

export default function SupplierProductTable({ products = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-8 text-center shadow-xs">
        <div className="w-6 h-6 mx-auto border-2 border-[#1769C2]/20 border-t-[#1769C2] rounded-full animate-spin mb-2" />
        <p className="text-xs text-[#64748B]">Loading products supplied...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-8 text-center shadow-xs space-y-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Package className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-[#0F172A]">No products are associated with this supplier.</p>
        <p className="text-[11px] text-[#64748B]">
          You can assign products to this vendor from the Product Management catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#D9E2EC] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Current Stock</th>
              <th className="py-3 px-4 text-center">Minimum Stock</th>
              <th className="py-3 px-4 text-center">Inventory Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
              >
                {/* Product Name */}
                <td className="py-3 px-4 font-bold text-[#0F172A]">
                  <div className="flex items-center gap-2">
                    <span className="group-hover:text-[#1769C2] transition truncate">
                      {p.name}
                    </span>
                    {!p.isActive && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </td>

                {/* SKU */}
                <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                  {p.sku}
                </td>

                {/* Category */}
                <td className="py-3 px-4 text-[#64748B]">
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {p.category}
                  </span>
                </td>

                {/* Current Stock */}
                <td className="py-3 px-4 text-center font-bold text-[#0F172A]">
                  {p.currentStock ?? p.current_stock ?? 0} {p.unit || 'units'}
                </td>

                {/* Minimum Stock */}
                <td className="py-3 px-4 text-center text-[#64748B]">
                  {p.minimumStock ?? p.minimum_stock ?? 0} {p.unit || 'units'}
                </td>

                {/* Inventory Status */}
                <td className="py-3 px-4 text-center">
                  <ProductStatusBadge status={p.stockStatus || p.stock_status || 'NORMAL'} />
                </td>

                {/* Action Link */}
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769C2] group-hover:underline">
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
