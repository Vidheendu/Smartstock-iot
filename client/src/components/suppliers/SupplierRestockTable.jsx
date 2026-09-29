import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import RestockStatusBadge from '../restock/RestockStatusBadge.jsx';

export default function SupplierRestockTable({ orders = [], loading = false }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-8 text-center shadow-xs">
        <div className="w-6 h-6 mx-auto border-2 border-[#1769C2]/20 border-t-[#1769C2] rounded-full animate-spin mb-2" />
        <p className="text-xs text-[#64748B]">Loading purchase orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-8 text-center shadow-xs space-y-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
          <ShoppingCart className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-[#0F172A]">No restock orders found for this supplier.</p>
        <p className="text-[11px] text-[#64748B]">
          Purchase orders initiated with this supplier will appear here with full shipment tracking.
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
              <th className="py-3 px-4">Order Number</th>
              <th className="py-3 px-4 text-center">Total Items</th>
              <th className="py-3 px-4 text-center">Total Quantity</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Ordered Date</th>
              <th className="py-3 px-4">Received Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => navigate(`/restocking/${o.id}`)}
                className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
              >
                {/* Order Number */}
                <td className="py-3.5 px-4 font-mono font-bold text-[#1769C2] group-hover:underline">
                  {o.orderNumber || o.order_number}
                </td>

                {/* Total Items */}
                <td className="py-3.5 px-4 text-center text-[#0F172A] font-semibold">
                  {o.totalItems ?? o.total_items ?? 0} lines
                </td>

                {/* Total Quantity */}
                <td className="py-3.5 px-4 text-center text-[#0F172A] font-extrabold">
                  {o.totalQuantity ?? 0} units
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <RestockStatusBadge status={o.status} />
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                  {formatDate(o.createdAt || o.created_at)}
                </td>

                {/* Ordered Date */}
                <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                  {formatDate(o.orderedAt || o.ordered_at)}
                </td>

                {/* Received Date */}
                <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                  {formatDate(o.receivedAt || o.received_at)}
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769C2] group-hover:underline">
                    <span>View Order</span>
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
