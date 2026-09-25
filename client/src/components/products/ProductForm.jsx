import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Save, X } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../../utils/productConstants.js';

export const ProductForm = ({
  initialData = null,
  suppliers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    category: initialData?.category || PRODUCT_CATEGORIES[0],
    customCategory: '',
    description: initialData?.description || '',
    supplierId: initialData?.supplierId || initialData?.supplier_id || '',
    currentStock: initialData?.currentStock !== undefined ? initialData.currentStock : 0,
    minimumStock: initialData?.minimumStock !== undefined ? initialData.minimumStock : 10,
    unit: initialData?.unit || 'units',
    price: initialData?.price !== undefined ? initialData.price : 0,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const isKnownCategory = PRODUCT_CATEGORIES.includes(initialData.category);
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: isKnownCategory ? initialData.category : 'Other',
        customCategory: isKnownCategory ? '' : initialData.category,
        description: initialData.description || '',
        supplierId: initialData.supplierId || initialData.supplier_id || '',
        currentStock: initialData.currentStock !== undefined ? initialData.currentStock : 0,
        minimumStock: initialData.minimumStock !== undefined ? initialData.minimumStock : 10,
        unit: initialData.unit || 'units',
        price: initialData.price !== undefined ? initialData.price : 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Product name is required';
    } else if (formData.name.length > 150) {
      errs.name = 'Product name cannot exceed 150 characters';
    }

    if (!formData.sku.trim()) {
      errs.sku = 'SKU is required';
    } else if (formData.sku.length > 50) {
      errs.sku = 'SKU cannot exceed 50 characters';
    }

    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      errs.category = 'Please enter a custom category name';
    }

    if (formData.currentStock === '' || isNaN(Number(formData.currentStock))) {
      errs.currentStock = 'Current stock is required and must be a number';
    } else if (Number(formData.currentStock) < 0) {
      errs.currentStock = 'Current stock cannot be negative';
    }

    if (formData.minimumStock === '' || isNaN(Number(formData.minimumStock))) {
      errs.minimumStock = 'Minimum stock is required and must be a number';
    } else if (Number(formData.minimumStock) < 0) {
      errs.minimumStock = 'Minimum stock cannot be negative';
    }

    if (!formData.unit.trim()) {
      errs.unit = 'Unit is required';
    }

    if (formData.price !== '' && Number(formData.price) < 0) {
      errs.price = 'Price cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory =
      formData.category === 'Other' && formData.customCategory.trim()
        ? formData.customCategory.trim()
        : formData.category;

    onSubmit({
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: finalCategory,
      description: formData.description.trim(),
      supplierId: formData.supplierId || null,
      currentStock: Math.max(0, parseInt(formData.currentStock, 10)),
      minimumStock: Math.max(0, parseInt(formData.minimumStock, 10)),
      unit: formData.unit.trim(),
      price: Math.max(0, parseFloat(formData.price || 0)),
      isActive: Boolean(formData.isActive)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Server Error Notice */}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Row 1: Name and SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Whole Milk"
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            placeholder="e.g. SKU-MILK-001"
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] uppercase"
          />
          {errors.sku && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.sku}</p>
          )}
        </div>
      </div>

      {/* Row 2: Category and Supplier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] cursor-pointer"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {formData.category === 'Other' ? (
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Custom Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              placeholder="Enter category name"
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
            />
            {errors.category && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.category}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Supplier
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] cursor-pointer"
            >
              <option value="">No Supplier Assigned</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-[11px] text-[#64748B] mt-1">No suppliers available.</p>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Stock Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            Current Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
          />
          {errors.currentStock && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.currentStock}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            Minimum Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
          />
          {errors.minimumStock && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.minimumStock}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            Unit <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] cursor-pointer"
          >
            {PRODUCT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {errors.unit && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.unit}</p>
          )}
        </div>
      </div>

      {/* Row 4: Price & Active Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
            Price ($ USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
          />
          {errors.price && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.price}</p>
          )}
        </div>

        <div className="flex items-center sm:pt-6">
          <label className="flex items-center gap-2.5 text-xs text-[#0F172A] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-[#1769C2] focus:ring-[#1769C2]"
            />
            <span className="font-bold">Active in Store Catalog</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Product specifications, storage directions, or packaging notes..."
          className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#D9E2EC]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#1769C2] hover:bg-[#1257A0] shadow-md shadow-blue-500/20 rounded-xl transition cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
