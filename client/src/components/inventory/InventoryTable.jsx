import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  History
} from 'lucide-react';
import ProductStatusBadge from '../products/ProductStatusBadge.jsx';

export const InventoryTable = ({
  items,
  isManager,
  onStockIn,
  onStockOut,
  onAdjust
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F4F8FC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Current Stock</th>
              <th className="py-3.5 px-4 text-right">Min Stock</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Last Updated</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-xs">
            {items.map((item) => {
              const current = Number(item.currentStock || 0);
              const min = Number(item.minimumStock || 0);

              return (
                <tr
                  key={item.productId}
                  className="hover:bg-slate-50/75 transition-colors group"
                >
                  {/* Product Name */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-semibold text-[#102A43] hover:text-[#1769C2] transition"
                    >
                      {item.name}
                    </Link>
                  </td>

                  {/* SKU */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                    {item.sku}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-[#64748B]">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-[#102A43] border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Current Stock */}
                  <td className="py-3.5 px-4 text-right font-semibold">
                    <span
                      className={
                        current === 0
                          ? 'text-red-600 font-bold'
                          : current <= min
                          ? 'text-amber-600 font-bold'
                          : 'text-[#102A43]'
                      }
                    >
                      {current}
                    </span>{' '}
                    <span className="text-[11px] font-normal text-[#64748B]">
                      {item.unit}
                    </span>
                  </td>

                  {/* Minimum Stock */}
                  <td className="py-3.5 px-4 text-right text-[#64748B]">
                    {min}{' '}
                    <span className="text-[11px]">{item.unit}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <ProductStatusBadge status={item.status} />
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-4 text-right text-[#64748B] text-[11px] whitespace-nowrap">
                    {item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Details */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="p-1.5 text-[#64748B] hover:text-[#1769C2] hover:bg-slate-100 rounded-lg transition"
                        title="View Product Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Stock History Shortcut */}
                      <Link
                        to={`/inventory/history?productId=${item.productId}`}
                        className="p-1.5 text-[#64748B] hover:text-[#1769C2] hover:bg-slate-100 rounded-lg transition"
                        title="View Stock History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </Link>

                      {/* Stock In */}
                      <button
                        onClick={() => onStockIn(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                        title="Stock In (+)"
                      >
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        <span>In</span>
                      </button>

                      {/* Stock Out */}
                      <button
                        onClick={() => onStockOut(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#1769C2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
                        title="Stock Out (-)"
                      >
                        <ArrowUpRight className="w-3 h-3 text-[#1769C2]" />
                        <span>Out</span>
                      </button>

                      {/* Adjust Stock (Manager only) */}
                      {isManager && (
                        <button
                          onClick={() => onAdjust(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
                          title="Adjust Stock Count"
                        >
                          <Sliders className="w-3 h-3 text-amber-600" />
                          <span>Adjust</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
