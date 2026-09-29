import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, ArrowUpRight, Package, AlertCircle } from 'lucide-react';
import { RESTOCK_STATUS_CONFIG } from '../../utils/restockConstants.js';

/**
 * ProductRestockCard component.
 * Displays associated purchase orders containing this product and allows
 * managers to launch pre-filled restock creation.
 */
export const ProductRestockCard = ({
  restockOrders = [],
  product,
  suggestedQuantity = 10,
  isManager = false,
  unit = 'units'
}) => {
  const navigate = useNavigate();

  const handleRestockProduct = () => {
    if (!product) return;
    const qty = suggestedQuantity > 0 ? suggestedQuantity : 10;
    const params = new URLSearchParams({
      action: 'new',
      productId: product.id,
      quantity: String(qty)
    });
    if (product.supplierId) {
      params.set('supplierId', product.supplierId);
    }
    navigate(`/restocking?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#1769C2]" />
              <span>Restock Orders</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#64748B] border border-[#D9E2EC]">
              {restockOrders.length} orders
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Procurement purchase orders including replenishment for {product?.name || 'this item'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isManager && (
            <button
              onClick={handleRestockProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1769C2] hover:bg-[#1257A0] rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              title={`Create restock order prefilled with ${suggestedQuantity} ${unit}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Restock Product ({suggestedQuantity} {unit})</span>
            </button>
          )}

          <Link
            to="/restocking"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer shadow-2xs"
          >
            <span>All Restock Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
          </Link>
        </div>
      </div>

      {restockOrders.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-2">
          <Package className="w-6 h-6 text-[#64748B] mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">No restock orders for this product.</p>
          <p className="text-[11px] text-[#64748B]">
            No purchase replenishment orders have been drafted or submitted for this item yet.
          </p>
          {isManager && (
            <button
              onClick={handleRestockProduct}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-[#dbeafe] rounded-lg transition border border-[#BFDBFE] cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create First Restock Order</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D9E2EC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Created Date</th>
                <th className="py-2.5 px-3">Received Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {restockOrders.map((order) => {
                const config = RESTOCK_STATUS_CONFIG[order.status] || {
                  label: order.status,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
                };

                return (
                  <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3">
                      <Link
                        to={`/restocking/${order.id}`}
                        className="font-mono font-bold text-[#1769C2] hover:underline flex items-center gap-1"
                        title="Click to view purchase order details"
                      >
                        <span>{order.orderNumber}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </Link>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-[#0F172A] truncate max-w-xs">
                      {order.supplier}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-[#0F172A]">
                      {order.quantity} {unit}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-2.5 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                      {order.receivedAt ? (
                        new Date(order.receivedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
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

export default ProductRestockCard;
