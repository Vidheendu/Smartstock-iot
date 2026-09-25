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
      className={`bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 shadow-lg space-y-3 transition ${
        isInactive ? 'opacity-60 bg-slate-900/60' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/products/${product.id}`}
            className="text-sm font-bold text-white hover:text-indigo-300 transition truncate block"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[11px] text-slate-400">
              {product.sku}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-300 bg-slate-700/60 px-2 py-0.2 rounded">
              {product.category}
            </span>
          </div>
        </div>
        <ProductStatusBadge status={product.stockStatus} />
      </div>

      {/* Stock metrics */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Current
          </span>
          <span
            className={`text-sm font-bold ${
              product.currentStock === 0
                ? 'text-red-400'
                : product.currentStock <= product.minimumStock
                ? 'text-amber-400'
                : 'text-white'
            }`}
          >
            {product.currentStock}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              {product.unit}
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Min Stock
          </span>
          <span className="text-sm font-bold text-slate-300">
            {product.minimumStock}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              {product.unit}
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Price
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            ${Number(product.price || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Supplier & Actions footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="text-slate-400 text-[11px] truncate max-w-[150px]">
          {product.supplier?.name ? (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{product.supplier.name}</span>
            </span>
          ) : (
            <span className="text-slate-600 italic">No supplier</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/products/${product.id}`}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isManager && (
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-amber-300 bg-slate-700/50 hover:bg-slate-700 transition cursor-pointer"
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
                  ? 'text-slate-600 bg-slate-800 cursor-not-allowed'
                  : 'text-slate-300 hover:text-red-400 bg-slate-700/50 hover:bg-red-500/20 cursor-pointer'
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
