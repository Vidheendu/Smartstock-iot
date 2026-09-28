import React from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';
import RestockStatusBadge from './RestockStatusBadge.jsx';
import {
  formatCurrency,
  formatRestockDate,
  RESTOCK_STATUS
} from '../../utils/restockConstants.js';

export default function RestockTable({
  orders = [],
  loading,
  suppliers = [],
  filterStatus,
  setFilterStatus,
  filterSupplier,
  setFilterSupplier,
  searchQuery,
  setSearchQuery,
  sortBy,
  sortOrder,
  onSort,
  isManager,
  onViewOrder,
  onEditOrder,
  onOrderOrder,
  onReceiveOrder,
  onCancelOrder
}) {
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: RESTOCK_STATUS.PENDING, label: 'Pending' },
    { value: RESTOCK_STATUS.ORDERED, label: 'Ordered' },
    { value: RESTOCK_STATUS.RECEIVED, label: 'Received' },
    { value: RESTOCK_STATUS.CANCELLED, label: 'Cancelled' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-xs overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-[#D9E2EC] bg-[#F8FAFC] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, supplier..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D9E2EC] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1769C2]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D9E2EC] rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0F172A] focus:outline-hidden cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="bg-white border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-hidden shadow-2xs cursor-pointer max-w-[180px] truncate"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#D9E2EC] bg-slate-50 text-[#64748B] font-bold uppercase tracking-wider select-none">
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#0F172A]"
                onClick={() => onSort && onSort('orderNumber')}
              >
                <div className="flex items-center gap-1.5">
                  Order Number
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Items / SKU</th>
              <th className="py-3 px-4 text-right">Total Qty</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#0F172A]"
                onClick={() => onSort && onSort('totalAmount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  Total Cost
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#0F172A]"
                onClick={() => onSort && onSort('status')}
              >
                <div className="flex items-center gap-1.5">
                  Status
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#0F172A]"
                onClick={() => onSort && onSort('createdAt')}
              >
                <div className="flex items-center gap-1.5">
                  Created Date
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Ordered Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-12 bg-slate-100 rounded ml-auto" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-100 rounded ml-auto" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-100 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-7 w-16 bg-slate-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 px-4 text-center">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-[#0F172A]">No restock orders yet</div>
                  <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                    Create your first restock order when inventory needs replenishment.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => onViewOrder && onViewOrder(order)}
                >
                  {/* Order Number */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1769C2]">
                    {order.orderNumber}
                  </td>

                  {/* Supplier */}
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                    {order.supplier?.name || 'Unassigned'}
                  </td>

                  {/* Items Summary */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700">
                      {order.totalItems} item{order.totalItems > 1 ? 's' : ''}
                    </span>
                    {order.items?.[0] && (
                      <span className="block text-[11px] text-[#64748B] truncate max-w-[150px]">
                        {order.items[0].productName}
                        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                      </span>
                    )}
                  </td>

                  {/* Total Quantity */}
                  <td className="py-3.5 px-4 text-right font-bold text-[#0F172A]">
                    {order.totalQuantity}
                  </td>

                  {/* Total Price */}
                  <td className="py-3.5 px-4 text-right font-extrabold text-[#0F172A]">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <RestockStatusBadge status={order.status} />
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {formatRestockDate(order.createdAt)}
                  </td>

                  {/* Ordered Date */}
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {formatRestockDate(order.orderedAt)}
                  </td>

                  {/* Actions Dropdown / Quick Buttons */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewOrder && onViewOrder(order)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769C2] hover:bg-slate-100 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isManager && order.status === RESTOCK_STATUS.PENDING && (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditOrder && onEditOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOrderOrder && onOrderOrder(order)}
                            className="p-1.5 rounded-lg text-[#1769C2] hover:bg-[#E8F2FF] transition-colors"
                            title="Mark as Ordered"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancelOrder && onCancelOrder(order)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Cancel order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {isManager && order.status === RESTOCK_STATUS.ORDERED && (
                        <>
                          <button
                            type="button"
                            onClick={() => onReceiveOrder && onReceiveOrder(order)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as Received (Increases Stock)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancelOrder && onCancelOrder(order)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Cancel order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
