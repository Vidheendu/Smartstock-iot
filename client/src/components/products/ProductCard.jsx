import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Building2 } from 'lucide-react';
import ProductStatusBadge from './ProductStatusBadge.jsx';

export const ProductCard = ({
  product,
  isManager = false,
  onEdit,
  onDelete
}) => {
  const isInactive = product.isActive === false;

  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3 transition ${
        isInactive ? 'opacity-60 bg-slate-50' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/products/${product.id}`}
            className="text-sm font-bold text-[#102A43] hover:text-[#1769C2] transition truncate block"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[11px] text-[#64748B]">
              {product.sku}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-[#102A43] bg-[#F4F8FC] px-2 py-0.2 rounded border border-[#E2E8F0]">
              {product.category}
            </span>
          </div>
        </div>
        <ProductStatusBadge status={product.stockStatus} />
      </div>

      {/* Stock metrics */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#F4F8FC] rounded-xl border border-[#E2E8F0] text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Current
          </span>
          <span
            className={`text-sm font-extrabold ${
              product.currentStock === 0
                ? 'text-red-600'
                : product.currentStock <= product.minimumStock
                ? 'text-amber-600'
                : 'text-[#102A43]'
            }`}
          >
            {product.currentStock}{' '}
            <span className="text-[10px] font-normal text-[#64748B]">
              {product.unit}
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Min Stock
          </span>
          <span className="text-sm font-bold text-[#64748B]">
            {product.minimumStock}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              {product.unit}
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Price
          </span>
          <span className="text-sm font-bold font-mono text-[#0B1F3A]">
            ${Number(product.price || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Supplier & Actions footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="text-[#64748B] text-[11px] truncate max-w-[150px]">
          {product.supplier?.name ? (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.supplier.name}</span>
            </span>
          ) : (
            <span className="text-slate-400 italic">No supplier</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/products/${product.id}`}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1769C2] hover:bg-royalblue-50 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isManager && (
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
              title="Edit Product"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {isManager && (
            <button
              onClick={() => onDelete(product)}
              disabled={isInactive}
              className={`p-1.5 rounded-lg transition ${
                isInactive
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-[#64748B] hover:text-red-600 hover:bg-red-50 cursor-pointer'
              }`}
              title={isInactive ? 'Already archived' : 'Deactivate Product'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
