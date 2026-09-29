import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { getSuppliers, getProducts } from '../../services/product.service.js';
import { createRestockOrder, updateRestockOrder } from '../../services/restock.service.js';
import { formatCurrency } from '../../utils/restockConstants.js';

export default function RestockOrderFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  isEdit = false
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 10, unitPrice: 0 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load suppliers and products on mount / open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        const [supRes, prodRes] = await Promise.all([
          getSuppliers(),
          getProducts({ isActive: 'true', limit: 100 })
        ]);

        if (isMounted) {
          const rawSupList = Array.isArray(supRes) ? supRes : (supRes?.data || []);
          // Show only ACTIVE suppliers for new orders (is_active = true)
          const activeSuppliers = rawSupList.filter(s =>
            (s.isActive !== false && s.is_active !== false) ||
            (isEdit && (s.id === initialData?.supplierId || s.id === initialData?.supplier_id))
          );
          const prodList = Array.isArray(prodRes?.data) ? prodRes.data : (Array.isArray(prodRes) ? prodRes : []);

          setSuppliers(activeSuppliers);
          setProducts(prodList);

          // Populate initial data if provided
          if (initialData) {
            setSupplierId(initialData.supplierId || initialData.supplier_id || (supList[0]?.id || ''));
            setNotes(initialData.notes || '');

            if (Array.isArray(initialData.items) && initialData.items.length > 0) {
              setItems(
                initialData.items.map((it) => ({
                  productId: it.productId || it.product_id,
                  quantity: it.quantity || 10,
                  unitPrice: it.unitPrice !== undefined ? it.unitPrice : 0
                }))
              );
            } else if (initialData.prefillProduct) {
              // Direct prefill from "Add to Restock"
              const prefill = initialData.prefillProduct;
              const prod = prodList.find((p) => p.id === prefill.productId);
              setSupplierId(prefill.supplierId || (supList[0]?.id || ''));
              setItems([
                {
                  productId: prefill.productId,
                  quantity: prefill.suggestedQuantity || 10,
                  unitPrice: prod?.price || prefill.price || 0
                }
              ]);
            }
          } else {
            // Default initial state
            setSupplierId(supList[0]?.id || '');
            setNotes('');
            const firstProd = prodList[0];
            setItems([
              {
                productId: firstProd?.id || '',
                quantity: 10,
                unitPrice: firstProd?.price || 0
              }
            ]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load suppliers and products for the order form.');
        }
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Handle product selection change in a row
  const handleProductChange = (index, newProductId) => {
    const selectedProd = products.find((p) => p.id === newProductId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: newProductId,
      unitPrice: selectedProd ? Number(selectedProd.price || 0) : 0
    };
    setItems(updated);
  };

  const handleQuantityChange = (index, val) => {
    const parsed = parseInt(val, 10);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantity: isNaN(parsed) ? '' : Math.max(1, parsed)
    };
    setItems(updated);
  };

  const handleUnitPriceChange = (index, val) => {
    const parsed = parseFloat(val);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      unitPrice: isNaN(parsed) ? '' : Math.max(0, parsed)
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    // Find first product not yet in items
    const selectedIds = new Set(items.map((i) => i.productId));
    const nextProd = products.find((p) => !selectedIds.has(p.id)) || products[0];

    setItems([
      ...items,
      {
        productId: nextProd?.id || '',
        quantity: 10,
        unitPrice: nextProd?.price || 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Grand total calculation
  const grandTotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!supplierId) {
      setError('Please select a supplier.');
      return;
    }

    if (items.length === 0) {
      setError('At least one product line is required.');
      return;
    }

    const seenIds = new Set();
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setError(`Line ${i + 1}: Please select a product.`);
        return;
      }
      if (seenIds.has(it.productId)) {
        const prod = products.find((p) => p.id === it.productId);
        setError(`Duplicate product: '${prod?.name || it.productId}' is included more than once.`);
        return;
      }
      seenIds.add(it.productId);

      if (!it.quantity || Number(it.quantity) <= 0) {
        setError(`Line ${i + 1}: Quantity must be greater than zero.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        supplierId,
        notes,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice) || 0
        }))
      };

      if (isEdit && initialData?.id) {
        await updateRestockOrder(initialData.id, payload);
      } else {
        await createRestockOrder(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to save restock order.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-xl border border-[#D9E2EC] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769C2]">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                {isEdit ? `Edit Restock Order ${initialData?.orderNumber || ''}` : 'Create Restock Order'}
              </h2>
              <p className="text-xs text-[#64748B]">
                Specify supplier, replenish quantities, and unit purchase prices
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
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Validation Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {loadingData ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
              <p className="text-xs font-semibold">Loading suppliers and product catalog...</p>
            </div>
          ) : (
            <form id="restock-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Supplier Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Select Supplier <span className="text-rose-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E2EC] bg-white text-xs font-semibold text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
                >
                  <option value="" disabled>-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.contactName ? `(${s.contactName})` : ''} — Lead Time: {s.leadTimeDays || s.lead_time_days || 3}d
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Order Items <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-[#64748B]">
                    {items.length} product line{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const rowTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] grid grid-cols-12 gap-3 items-center"
                      >
                        {/* Product Dropdown */}
                        <div className="col-span-12 sm:col-span-5">
                          <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                            Product
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-[#D9E2EC] bg-white text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#1769C2]"
                          >
                            <option value="" disabled>-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Stock: {p.currentStock}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(idx, e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-[#D9E2EC] bg-white text-xs font-bold text-[#0F172A] focus:outline-hidden focus:border-[#1769C2]"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                            Unit Price ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUnitPriceChange(idx, e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-[#D9E2EC] bg-white text-xs font-bold text-[#0F172A] focus:outline-hidden focus:border-[#1769C2]"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-10 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                            Subtotal
                          </label>
                          <div className="py-2 text-xs font-extrabold text-[#0F172A]">
                            {formatCurrency(rowTotal)}
                          </div>
                        </div>

                        {/* Remove Action */}
                        <div className="col-span-2 sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className={`p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                              items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Remove product line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Another Product Line */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1769C2] bg-[#E8F2FF] hover:bg-[#D4E8FF] border border-[#BFDBFE] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Product
                </button>
              </div>

              {/* Order Grand Total */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Estimated Order Total
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Calculated from {items.length} line item(s)
                  </span>
                </div>
                <div className="text-xl font-extrabold text-[#1769C2]">
                  {formatCurrency(grandTotal)}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Order Notes & Instructions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="e.g. Urgent shelf replenishment, delivery dock B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E2EC] bg-white text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D9E2EC] flex items-center justify-end gap-3 bg-[#F8FAFC] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="restock-form"
            disabled={submitting || loadingData}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] shadow-xs disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Restock Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
