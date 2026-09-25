import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Building2 } from 'lucide-react';
import ProductStatusBadge from './ProductStatusBadge.jsx';

export const ProductTable = ({
  products = [],
  isManager = false,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#D9E2EC] bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
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
        <tbody className="divide-y divide-[#D9E2EC] text-xs text-[#0F172A]">
          {products.map((product) => {
            const isInactive = product.isActive === false;

            return (
              <tr
                key={product.id}
                className={`transition-colors hover:bg-[#F8FAFC] ${
                  isInactive ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                {/* Product Name & Details */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-[#0F172A] hover:text-[#1769C2] transition-colors">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </div>
                  {isInactive && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-[#64748B]">
                      Inactive / Archived
                    </span>
                  )}
                </td>

                {/* SKU */}
                <td className="py-3.5 px-3 font-mono text-[#64748B] font-medium">
                  {product.sku}
                </td>

                {/* Category */}
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] border border-[#D9E2EC] text-[#0F172A] text-[11px] font-medium">
                    {product.category}
                  </span>
                </td>

                {/* Supplier */}
                <td className="py-3.5 px-3 text-[#64748B] truncate max-w-[140px]">
                  {product.supplier?.name ? (
                    <span className="flex items-center gap-1.5" title={product.supplier.name}>
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{product.supplier.name}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No supplier</span>
                  )}
                </td>

                {/* Current Stock */}
                <td className="py-3.5 px-3 text-right font-medium">
                  <span
                    className={`font-extrabold ${
                      product.currentStock === 0
                        ? 'text-red-600'
                        : product.currentStock <= product.minimumStock
                        ? 'text-amber-600'
                        : 'text-[#0F172A]'
                    }`}
                  >
                    {product.currentStock}
                  </span>{' '}
                  <span className="text-[11px] text-[#64748B]">{product.unit}</span>
                </td>

                {/* Minimum Stock */}
                <td className="py-3.5 px-3 text-right text-[#64748B] font-medium">
                  <span>{product.minimumStock}</span>{' '}
                  <span className="text-[11px] text-slate-400">{product.unit}</span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 text-center">
                  <ProductStatusBadge status={product.stockStatus} />
                </td>

                {/* Price */}
                <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                  ${Number(product.price || 0).toFixed(2)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* View Details */}
                    <Link
                      to={`/products/${product.id}`}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1769C2] hover:bg-royalblue-50 transition"
                      title="View product details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit (Manager only) */}
                    {isManager && (
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
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
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-[#64748B] hover:text-red-600 hover:bg-red-50 cursor-pointer'
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
