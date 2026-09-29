import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import ProductModal from './ProductModal.jsx';
import { stockIn, stockOut } from '../../services/inventory.service.js';

/**
 * StockActionModal component.
 * Provides unified Stock-In and Stock-Out execution reusing existing Phase 5 inventory service.
 * Enforces quantity > 0 and strictly prevents negative stock.
 */
export const StockActionModal = ({ isOpen, onClose, mode = 'STOCK_IN', product, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isStockIn = mode === 'STOCK_IN';
  const title = isStockIn ? `Stock In: ${product?.name}` : `Stock Out: ${product?.name}`;
  const currentStock = Number(product?.currentStock ?? 0);
  const unit = product?.unit || 'units';

  const resetForm = () => {
    setQuantity('');
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason or reference for this transaction.');
      return;
    }

    // Guard against negative stock on frontend before API call
    if (!isStockIn && parsedQty > currentStock) {
      setError(`Insufficient stock. Current on-hand inventory is ${currentStock} ${unit}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      let res;
      if (isStockIn) {
        res = await stockIn(product.id, parsedQty, reason.trim());
      } else {
        res = await stockOut(product.id, parsedQty, reason.trim());
      }

      resetForm();
      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Transaction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductModal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stock Level Context Pill */}
        <div className="p-3 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl flex items-center justify-between text-xs">
          <span className="text-[#64748B]">Current Available Stock:</span>
          <span className="font-extrabold text-[#0F172A]">
            {currentStock} {unit}
          </span>
        </div>

        {/* Quantity Field */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1">
            Quantity to {isStockIn ? 'Receive' : 'Deduct'} ({unit}) *
          </label>
          <input
            type="number"
            min="1"
            max={!isStockIn ? currentStock : undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 10"
            required
            className="w-full px-3 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
          />
          {!isStockIn && (
            <p className="text-[11px] text-[#64748B] mt-1">
              Maximum allowable deduction: {currentStock} {unit} (Negative inventory prevented)
            </p>
          )}
        </div>

        {/* Reason Field */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1">
            Reason / Reference *
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isStockIn
                ? 'e.g. Received shipment, Supplier restock PO-102'
                : 'e.g. Shelf sale checkout, Damaged items scrap, Transfer'
            }
            required
            className="w-full px-3 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D9E2EC]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 border border-[#D9E2EC] rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl transition cursor-pointer disabled:opacity-50 ${
              isStockIn
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                : 'bg-[#1769C2] hover:bg-[#1257A0] shadow-md shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isStockIn ? (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Confirm Stock In</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Confirm Stock Out</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ProductModal>
  );
};

export default StockActionModal;
