import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  History,
  Package
} from 'lucide-react';
import ProductStatusBadge from '../products/ProductStatusBadge.jsx';

export const InventoryCard = ({
  item,
  isManager,
  onStockIn,
  onStockOut,
  onAdjust
}) => {
  const current = Number(item.currentStock || 0);
  const min = Number(item.minimumStock || 0);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header: Title and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <Link
            to={`/products/${item.productId}`}
            className="font-bold text-sm text-[#102A43] hover:text-[#1769C2] transition line-clamp-1"
          >
            {item.name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#64748B]">{item.sku}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-[#102A43] border border-slate-200">
              {item.category}
            </span>
          </div>
        </div>
        <ProductStatusBadge status={item.status} />
      </div>

      {/* Stock Level Display */}
      <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F4F8FC] border border-[#E2E8F0] rounded-xl text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Current Stock
          </span>
          <span
            className={`text-base font-bold ${
              current === 0
                ? 'text-red-600'
                : current <= min
                ? 'text-amber-600'
                : 'text-[#102A43]'
            }`}
          >
            {current} <span className="text-xs font-normal text-[#64748B]">{item.unit}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Min Threshold
          </span>
          <span className="text-sm font-semibold text-[#64748B]">
            {min} {item.unit}
          </span>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#E2E8F0] text-xs">
        <div className="flex items-center gap-1.5">
          <Link
            to={`/products/${item.productId}`}
            className="p-1.5 text-[#64748B] hover:text-[#1769C2] hover:bg-slate-100 rounded-lg transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/inventory/history?productId=${item.productId}`}
            className="p-1.5 text-[#64748B] hover:text-[#1769C2] hover:bg-slate-100 rounded-lg transition"
            title="View History"
          >
            <History className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onStockIn(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>In</span>
          </button>

          <button
            onClick={() => onStockOut(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1769C2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#1769C2]" />
            <span>Out</span>
          </button>

          {isManager && (
            <button
              onClick={() => onAdjust(item)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Adjust</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
