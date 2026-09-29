import React, { useState } from 'react';
import {
  X,
  Package,
  Calendar,
  Truck,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Send,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import RestockStatusBadge from './RestockStatusBadge.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { formatCurrency, formatRestockDateTime, RESTOCK_STATUS } from '../../utils/restockConstants.js';
import { markRestockOrdered, receiveRestockOrder, cancelRestockOrder } from '../../services/restock.service.js';

export default function RestockOrderDetailsModal({
  isOpen,
  onClose,
  order,
  isManager,
  onActionSuccess,
  onEditClick
}) {
  const [processingAction, setProcessingAction] = useState(false);
  const [confirmReceive, setConfirmReceive] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (!isOpen || !order) return null;

  const handleMarkOrdered = async () => {
    try {
      setProcessingAction(true);
      setActionError(null);
      await markRestockOrdered(order.id);
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReceive = async () => {
    try {
      setProcessingAction(true);
      setActionError(null);
      await receiveRestockOrder(order.id);
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to receive restock order');
    } finally {
      setProcessingAction(false);
      setConfirmReceive(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmCancel(true);
  };

  const handleConfirmCancelOrder = async () => {
    try {
      setProcessingAction(true);
      setActionError(null);
      await cancelRestockOrder(order.id, 'Cancelled by user');
      setShowConfirmCancel(false);
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to cancel order');
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-xl border border-[#D9E2EC] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#D9E2EC] flex items-center justify-center text-[#1769C2] shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-[#0F172A] font-mono">
                  {order.orderNumber}
                </h2>
                <RestockStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Restock purchase order details and line items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {actionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Supplier & Timestamps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#D9E2EC]">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <Truck className="w-4 h-4 text-[#1769C2]" />
                Supplier Information
              </div>
              <div className="font-bold text-sm text-[#0F172A]">
                {order.supplier?.name || 'Unassigned Supplier'}
              </div>
              {order.supplier && (
                <div className="mt-1 text-xs text-[#64748B] space-y-0.5">
                  {order.supplier.contactName && <div>Contact: {order.supplier.contactName}</div>}
                  {order.supplier.email && <div>Email: {order.supplier.email}</div>}
                  {order.supplier.phone && <div>Phone: {order.supplier.phone}</div>}
                  {order.supplier.leadTimeDays && (
                    <div className="font-semibold text-slate-700">
                      Standard Lead Time: {order.supplier.leadTimeDays} days
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audit & Timestamps */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#D9E2EC]">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#1769C2]" />
                Audit & Timeline
              </div>
              <div className="text-xs text-[#475569] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Created:</span>
                  <span className="font-semibold">{formatRestockDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Ordered:</span>
                  <span className="font-semibold">{formatRestockDateTime(order.orderedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Received:</span>
                  <span className="font-semibold">{formatRestockDateTime(order.receivedAt)}</span>
                </div>
                {order.createdBy && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-[#64748B]">Created By:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {order.createdBy.name} ({order.createdBy.role})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {order.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">Notes:</span>
              <p className="text-amber-800">{order.notes}</p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Order Items ({order.items?.length || 0})
              </h3>
              <span className="text-xs font-bold text-[#64748B]">
                Total Quantity: {order.totalQuantity || order.items?.reduce((s, i) => s + i.quantity, 0)} units
              </span>
            </div>

            <div className="border border-[#D9E2EC] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D9E2EC] bg-slate-50 text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4 text-right">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                  {order.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-[#0F172A]">{item.productName}</div>
                        <div className="text-[11px] text-[#64748B]">{item.category}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#475569]">{item.sku}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#0F172A]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#475569]">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#0F172A]">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/80 font-bold border-t border-[#D9E2EC]">
                    <td colSpan="4" className="py-3 px-4 text-right text-[#64748B] uppercase">
                      Order Grand Total:
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-extrabold text-[#1769C2]">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Confirm Receive Prompt Banner */}
          {confirmReceive && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Confirm Stock In Receipt
              </div>
              <p>
                Receiving order <strong>{order.orderNumber}</strong> will immediately increase stock
                for all {order.items?.length} product(s) and record official inventory history.
                This action is irreversible.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReceive}
                  disabled={processingAction}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {processingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Yes, Mark Received
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReceive(false)}
                  disabled={processingAction}
                  className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors"
          >
            Close
          </button>

          {/* Manager-only Action Buttons */}
          {isManager && (
            <div className="flex items-center gap-2">
              {order.status === RESTOCK_STATUS.PENDING && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onEditClick) onEditClick(order);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0F172A] bg-white border border-[#D9E2EC] hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={processingAction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Order
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkOrdered}
                    disabled={processingAction}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] shadow-xs transition-colors"
                  >
                    {processingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Mark as Ordered
                  </button>
                </>
              )}

              {order.status === RESTOCK_STATUS.ORDERED && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={processingAction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Order
                  </button>
                  {!confirmReceive && (
                    <button
                      type="button"
                      onClick={() => setConfirmReceive(true)}
                      disabled={processingAction}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Received
                    </button>
                  )}
                </>
              )}

              {order.status === RESTOCK_STATUS.RECEIVED && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Inventory received and updated
                </span>
              )}

              {order.status === RESTOCK_STATUS.CANCELLED && (
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Order Cancelled
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirmCancel && (
        <ConfirmDialog
          isOpen={showConfirmCancel}
          title="Cancel Restock Order"
          message={`Are you sure you want to cancel order ${order.orderNumber}? This action cannot be undone.`}
          confirmText="Cancel Order"
          variant="danger"
          loading={processingAction}
          onConfirm={handleConfirmCancelOrder}
          onCancel={() => setShowConfirmCancel(false)}
        />
      )}
    </div>
  );
}
