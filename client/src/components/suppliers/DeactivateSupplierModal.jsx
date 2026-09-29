import React from 'react';
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';

export default function DeactivateSupplierModal({
  isOpen,
  onClose,
  onConfirm,
  supplier,
  loading = false
}) {
  if (!isOpen || !supplier) return null;

  const isCurrentlyActive = Boolean(supplier.isActive ?? supplier.is_active);
  const targetActive = !isCurrentlyActive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              targetActive
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {targetActive ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title and Message */}
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            {targetActive ? 'Activate this supplier?' : 'Deactivate this supplier?'}
          </h3>
          <p className="text-xs font-semibold text-[#1769C2] mt-0.5">
            {supplier.name}
          </p>
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#64748B] space-y-1.5">
            {targetActive ? (
              <p>
                Activating will make this supplier selectable again when creating new restock orders and assigning products.
              </p>
            ) : (
              <>
                <p className="font-semibold text-slate-700">
                  Existing products and historical restock orders will remain linked.
                </p>
                <p>
                  This supplier will no longer appear in selection dropdowns for new restock orders. Historical records are preserved and never deleted.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-white border border-[#D9E2EC] rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(supplier, targetActive)}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition cursor-pointer ${
              targetActive
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {targetActive ? 'Confirm Activation' : 'Confirm Deactivation'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
