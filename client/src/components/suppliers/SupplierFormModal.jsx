import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { createSupplier, updateSupplier } from '../../services/supplier.service.js';

export default function SupplierFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  isEdit = false
}) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    notes: '',
    leadTimeDays: 3
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        setFormData({
          name: initialData.name || '',
          contactPerson: initialData.contactPerson || initialData.contact_person || initialData.contactName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          city: initialData.city || '',
          state: initialData.state || '',
          country: initialData.country || '',
          postalCode: initialData.postalCode || initialData.postal_code || '',
          notes: initialData.notes || '',
          leadTimeDays: initialData.leadTimeDays || initialData.lead_time_days || 3
        });
      } else {
        setFormData({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          notes: '',
          leadTimeDays: 3
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, isEdit]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!formData.name || !formData.name.trim()) {
      return 'Supplier name is required.';
    }
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return 'Please enter a valid email address.';
      }
    }
    if (formData.phone && formData.phone.trim()) {
      if (formData.phone.trim().length < 5 || formData.phone.trim().length > 50) {
        return 'Phone number must be between 5 and 50 characters.';
      }
    }
    if (formData.postalCode && formData.postalCode.trim()) {
      if (formData.postalCode.trim().length > 30) {
        return 'Postal code cannot exceed 30 characters.';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        contact_person: formData.contactPerson.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        postal_code: formData.postalCode.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim(),
        lead_time_days: parseInt(formData.leadTimeDays, 10) || 3
      };

      if (isEdit && initialData?.id) {
        await updateSupplier(initialData.id, payload);
      } else {
        await createSupplier(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || (isEdit ? 'Unable to update supplier.' : 'Unable to create supplier.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-2xl max-w-xl w-full my-8 overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-[#D9E2EC] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1769C2]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {isEdit
                  ? 'Update supplier contact, address, and logistics information'
                  : 'Register a verified vendor for inventory procurement'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Dairy & Bakery Ltd"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
            />
          </div>

          {/* Contact Person & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="e.g. orders@supplier.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
          </div>

          {/* Phone & Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +1-555-0192"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="3"
                value={formData.leadTimeDays}
                onChange={(e) => handleChange('leadTimeDays', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. 104 Meadow Lane, Suite 200"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
            />
          </div>

          {/* City, State, Country, Postal Code */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Country
              </label>
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Postal Code
              </label>
              <input
                type="text"
                placeholder="Postal"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Minimum order size, payment terms, or delivery schedule preferences..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#D9E2EC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-white border border-[#D9E2EC] rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? 'Save Changes' : 'Save Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
