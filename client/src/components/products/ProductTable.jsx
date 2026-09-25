import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, AlertCircle, Building2 } from 'lucide-react';
import ProductStatusBadge from './ProductStatusBadge.jsx';

export const ProductTable = ({
  products = [],
  isManager = false,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-700/70 bg-slate-800/80 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700/80 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <th className="py-3.5 px-4">Product</th>
            <th className="py-3.5 px-3">SKU</th>
            <th className="py-3.5 px-3">Category</th>
            <th className="py-3.5 px-3">Supplier</th>
            <th className="py-3.5 px-3 text-right">Current Stock</th>
            <th className="py-3.5 px-3 text-right">Min Stock</th>
            <th className="py-3.5 px-3 text-center">Status</th>
            <th className="py-3.5 px-3 text-right">Price</th>
            <th className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 text-xs text-slate-200">
          {products.map((product) => {
            const isInactive = product.isActive === false;

            return (
              <tr
                key={product.id}
                className={`transition-colors hover:bg-slate-700/40 ${
                  isInactive ? 'opacity-60 bg-slate-900/40' : ''
                }`}
              >
                {/* Product Name & Details */}
                <td className="py-3 px-4">
                  <div className="font-semibold text-white hover:text-indigo-300 transition-colors">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </div>
                  {isInactive && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700 text-slate-400 border border-slate-600">
                      Inactive / Archived
                    </span>
                  )}
                </td>

                {/* SKU */}
                <td className="py-3 px-3 font-mono text-slate-300">
                  {product.sku}
                </td>

                {/* Category */}
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-700/50 border border-slate-600/50 text-slate-300 text-[11px]">
                    {product.category}
                  </span>
                </td>

                {/* Supplier */}
                <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                  {product.supplier?.name ? (
                    <span className="flex items-center gap-1.5" title={product.supplier.name}>
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{product.supplier.name}</span>
                    </span>
                  ) : (
                    <span className="text-slate-600 italic">No supplier</span>
                  )}
                </td>

                {/* Current Stock */}
                <td className="py-3 px-3 text-right font-medium">
                  <span
                    className={`font-bold ${
                      product.currentStock === 0
                        ? 'text-red-400'
                        : product.currentStock <= product.minimumStock
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}
                  >
                    {product.currentStock}
                  </span>{' '}
                  <span className="text-[11px] text-slate-400">{product.unit}</span>
                </td>

                {/* Minimum Stock */}
                <td className="py-3 px-3 text-right text-slate-400">
                  <span>{product.minimumStock}</span>{' '}
                  <span className="text-[11px] text-slate-500">{product.unit}</span>
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-center">
                  <ProductStatusBadge status={product.stockStatus} />
                </td>

                {/* Price */}
                <td className="py-3 px-3 text-right font-mono font-medium text-white">
                  ${Number(product.price || 0).toFixed(2)}
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* View Details */}
                    <Link
                      to={`/products/${product.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition"
                      title="View product details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit (Manager only) */}
                    {isManager && (
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700 transition cursor-pointer"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete / Deactivate (Manager only) */}
                    {isManager && (
                      <button
                        onClick={() => onDelete(product)}
                        disabled={isInactive}
                        className={`p-1.5 rounded-lg transition ${
                          isInactive
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                        }`}
                        title={isInactive ? 'Already deactivated' : 'Deactivate product'}
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};

export default ProductTable;
