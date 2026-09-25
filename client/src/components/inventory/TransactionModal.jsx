import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  AlertTriangle,
  Loader2,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import InventoryModal from './InventoryModal.jsx';
import ProductStatusBadge from '../products/ProductStatusBadge.jsx';

// Client-side stock status helper
function calculateNewStatus(stock, min) {
  const s = Number(stock);
  const m = Number(min);
  if (isNaN(s) || s <= 0) return 'OUT_OF_STOCK';
  if (s <= 0.5 * m) return 'CRITICAL';
  if (s <= m) return 'LOW';
  return 'NORMAL';
}

export const TransactionModal = ({
  isOpen,
  onClose,
  product,
  initialType = 'STOCK_IN',
  onSubmit,
  isSubmitting = false,
  serverError = null,
  isManager = false
}) => {
  const [transactionType, setTransactionType] = useState(initialType);
  const [quantity, setQuantity] = useState('');
  const [newStockInput, setNewStockInput] = useState('');
  const [reason, setReason] = useState('');
  const [clientError, setClientError] = useState(null);

  // Sync initial type whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTransactionType(initialType);
      setQuantity('');
      setNewStockInput('');
      setReason('');
      setClientError(null);
    }
  }, [isOpen, initialType]);

  const currentStock = product ? Number(product.currentStock || 0) : 0;
  const minimumStock = product ? Number(product.minimumStock || 0) : 0;

  // Real-time calculation of prospective new stock and change delta
  const { calculatedNewStock, changeDelta, isInsufficientStock, isInvalidInput } = useMemo(() => {
    if (!product) {
      return { calculatedNewStock: 0, changeDelta: 0, isInsufficientStock: false, isInvalidInput: false };
    }

    if (transactionType === 'STOCK_IN') {
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return { calculatedNewStock: currentStock, changeDelta: 0, isInsufficientStock: false, isInvalidInput: true };
      }
      return {
        calculatedNewStock: currentStock + qty,
        changeDelta: qty,
        isInsufficientStock: false,
        isInvalidInput: false
      };
    }

    if (transactionType === 'STOCK_OUT') {
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return { calculatedNewStock: currentStock, changeDelta: 0, isInsufficientStock: false, isInvalidInput: true };
      }
      const insufficient = qty > currentStock;
      const newStock = Math.max(0, currentStock - qty);
      return {
        calculatedNewStock: newStock,
        changeDelta: -qty,
        isInsufficientStock: insufficient,
        isInvalidInput: insufficient
      };
    }

    if (transactionType === 'ADJUSTMENT') {
      const target = parseInt(newStockInput, 10);
      if (isNaN(target) || target < 0) {
        return { calculatedNewStock: currentStock, changeDelta: 0, isInsufficientStock: false, isInvalidInput: true };
      }
      return {
        calculatedNewStock: target,
        changeDelta: target - currentStock,
        isInsufficientStock: false,
        isInvalidInput: false
      };
    }

    return { calculatedNewStock: currentStock, changeDelta: 0, isInsufficientStock: false, isInvalidInput: false };
  }, [product, transactionType, quantity, newStockInput, currentStock]);

  const previewStatus = useMemo(() => {
    return calculateNewStatus(calculatedNewStock, minimumStock);
  }, [calculatedNewStock, minimumStock]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError(null);

    const cleanReason = reason.trim();
    if (!cleanReason) {
      setClientError('Reason is required and cannot be empty.');
      return;
    }

    if (transactionType === 'STOCK_IN') {
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setClientError('Quantity must be greater than zero.');
        return;
      }
      onSubmit({
        type: 'STOCK_IN',
        productId: product.productId || product.id,
        quantity: qty,
        reason: cleanReason
      });
    } else if (transactionType === 'STOCK_OUT') {
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setClientError('Quantity must be greater than zero.');
        return;
      }
      if (qty > currentStock) {
        setClientError('Insufficient stock.');
        return;
      }
      onSubmit({
        type: 'STOCK_OUT',
        productId: product.productId || product.id,
        quantity: qty,
        reason: cleanReason
      });
    } else if (transactionType === 'ADJUSTMENT') {
      const target = parseInt(newStockInput, 10);
      if (isNaN(target) || target < 0) {
        setClientError('New stock cannot be negative.');
        return;
      }
      onSubmit({
        type: 'ADJUSTMENT',
        productId: product.productId || product.id,
        newStock: target,
        reason: cleanReason
      });
    }
  };

  if (!product) return null;

  return (
    <InventoryModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inventory Transaction — ${product.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setTransactionType('STOCK_IN');
              setClientError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              transactionType === 'STOCK_IN'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-[#64748B] hover:text-[#102A43]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stock In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTransactionType('STOCK_OUT');
              setClientError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              transactionType === 'STOCK_OUT'
                ? 'bg-white text-[#1769C2] shadow-sm'
                : 'text-[#64748B] hover:text-[#102A43]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#1769C2]" />
            <span>Stock Out</span>
          </button>

          <button
            type="button"
            disabled={!isManager}
            onClick={() => {
              if (isManager) {
                setTransactionType('ADJUSTMENT');
                setClientError(null);
              }
            }}
            title={!isManager ? 'Manager access required' : ''}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              !isManager
                ? 'opacity-40 cursor-not-allowed text-[#64748B]'
                : transactionType === 'ADJUSTMENT'
                ? 'bg-white text-amber-700 shadow-sm cursor-pointer'
                : 'text-[#64748B] hover:text-[#102A43] cursor-pointer'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>Adjust {!isManager && '(Mgr)'}</span>
          </button>
        </div>

        {/* Product Context Banner */}
        <div className="flex items-center justify-between p-3.5 bg-[#F4F8FC] border border-[#E2E8F0] rounded-xl text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] flex items-center justify-center text-[#1769C2]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#102A43]">{product.name}</p>
              <p className="text-[11px] font-mono text-[#64748B]">{product.sku}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">
              Current Stock
            </span>
            <span className="text-sm font-bold text-[#102A43]">
              {currentStock} <span className="text-xs font-normal text-[#64748B]">{product.unit}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Input Fields */}
        <div className="space-y-4">
          {transactionType === 'ADJUSTMENT' ? (
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                New Physical Stock Count <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={newStockInput}
                  onChange={(e) => {
                    setNewStockInput(e.target.value);
                    setClientError(null);
                  }}
                  placeholder={`e.g. ${currentStock}`}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#102A43] focus:outline-none focus:border-[#1769C2] focus:ring-1 focus:ring-[#1769C2] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#64748B]">
                  {product.unit}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Enter the absolute physical unit count verified during stock audit.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                {transactionType === 'STOCK_IN' ? 'Quantity Received' : 'Quantity To Deduct'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setClientError(null);
                  }}
                  placeholder="e.g. 10"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#102A43] focus:outline-none focus:border-[#1769C2] focus:ring-1 focus:ring-[#1769C2] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#64748B]">
                  {product.unit}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
              Reason / Justification <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setClientError(null);
              }}
              placeholder={
                transactionType === 'STOCK_IN'
                  ? 'e.g. New stock delivery PO-1029'
                  : transactionType === 'STOCK_OUT'
                  ? 'e.g. Store sale, damaged packaging'
                  : 'e.g. Physical inventory count discrepancy'
              }
              className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs sm:text-sm text-[#102A43] focus:outline-none focus:border-[#1769C2] focus:ring-1 focus:ring-[#1769C2] transition"
            />
          </div>
        </div>

        {/* Real-Time Transaction Preview Card (Part 23) */}
        <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Transaction Impact Preview
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block">Current</span>
              <span className="font-bold text-[#102A43]">{currentStock}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block">Change</span>
              <span
                className={`font-bold ${
                  changeDelta > 0
                    ? 'text-emerald-600'
                    : changeDelta < 0
                    ? 'text-[#1769C2]'
                    : 'text-[#64748B]'
                }`}
              >
                {changeDelta > 0 ? `+${changeDelta}` : changeDelta}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block">New Stock</span>
              <span className="font-bold text-[#102A43]">{calculatedNewStock}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#64748B]">Projected Status:</span>
            <ProductStatusBadge status={previewStatus} />
          </div>
        </div>

        {/* Insufficient Stock Warning */}
        {isInsufficientStock && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Insufficient stock.</p>
              <p className="text-[11px] text-red-600 mt-0.5">
                Cannot stock out {quantity} {product.unit}. Current available stock is only {currentStock} {product.unit}.
              </p>
            </div>
          </div>
        )}

        {/* Server or Client Error Banner */}
        {(clientError || serverError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{clientError || serverError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isInsufficientStock || isInvalidInput}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              transactionType === 'STOCK_IN'
                ? 'bg-[#10B981] hover:bg-[#059669] shadow-emerald-500/20'
                : transactionType === 'STOCK_OUT'
                ? 'bg-[#1769C2] hover:bg-[#1257A0] shadow-blue-500/20'
                : 'bg-gradient-to-r from-[#1769C2] to-[#10B981] hover:opacity-95 shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating stock...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {transactionType === 'STOCK_IN'
                    ? 'Confirm Stock In'
                    : transactionType === 'STOCK_OUT'
                    ? 'Confirm Stock Out'
                    : 'Confirm Adjustment'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </InventoryModal>
  );
};

export default TransactionModal;
