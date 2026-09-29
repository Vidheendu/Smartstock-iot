import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * SupplierStatusBadge
 * Distinct ACTIVE / INACTIVE badge for suppliers.
 * Designed to avoid confusion with inventory or restock statuses.
 */
export default function SupplierStatusBadge({ isActive, size = 'sm' }) {
  const active = Boolean(isActive);

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1 font-semibold';

  if (active) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 ${sizeClasses}`}
        title="Supplier is active and available for new restock orders and product assignments"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>ACTIVE</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 text-slate-600 ${sizeClasses}`}
      title="Supplier is deactivated. Historical orders and products remain linked, but new orders cannot be created."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span>INACTIVE</span>
    </span>
  );
}
