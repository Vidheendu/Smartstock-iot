import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowUpDown,
  Eye,
  Edit2,
  Power,
  Package,
  ShoppingCart,
  Mail,
  Phone,
  Plus
} from 'lucide-react';
import SupplierStatusBadge from './SupplierStatusBadge.jsx';

export default function SupplierTable({
  suppliers = [],
  loading = false,
  sortBy = 'name',
  sortOrder = 'asc',
  onSort,
  onEdit,
  onToggleStatus,
  onAddNew,
  isManager = false
}) {
  const navigate = useNavigate();

  const renderSortIndicator = (field) => {
    const isCurrent = sortBy === field;
    return (
      <ArrowUpDown
        className={`w-3 h-3 transition-colors ${
          isCurrent ? 'text-[#1769C2]' : 'text-slate-400 group-hover:text-slate-600'
        }`}
      />
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center shadow-xs">
        <div className="w-8 h-8 mx-auto border-3 border-[#1769C2]/20 border-t-[#1769C2] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#0F172A]">Loading suppliers...</p>
        <p className="text-[11px] text-[#64748B] mt-0.5">Fetching directory and inventory relationships</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center shadow-xs space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1769C2]">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">No suppliers found</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Add your first supplier to start managing restocking relationships.
          </p>
        </div>
        {isManager && onAddNew && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Supplier</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#D9E2EC] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              {/* Supplier Name */}
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort && onSort('name')}
                  className="flex items-center gap-1.5 hover:text-[#0F172A] cursor-pointer group"
                >
                  <span>Supplier</span>
                  {renderSortIndicator('name')}
                </button>
              </th>

              {/* Contact Person */}
              <th className="py-3 px-4">Contact Person</th>

              {/* Email */}
              <th className="py-3 px-4">Email</th>

              {/* Phone */}
              <th className="py-3 px-4">Phone</th>

              {/* Products */}
              <th className="py-3 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onSort && onSort('products')}
                  className="flex items-center gap-1.5 mx-auto hover:text-[#0F172A] cursor-pointer group"
                >
                  <span>Products</span>
                  {renderSortIndicator('products')}
                </button>
              </th>

              {/* Active Orders */}
              <th className="py-3 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onSort && onSort('activeOrders')}
                  className="flex items-center gap-1.5 mx-auto hover:text-[#0F172A] cursor-pointer group"
                >
                  <span>Active Orders</span>
                  {renderSortIndicator('activeOrders')}
                </button>
              </th>

              {/* Status */}
              <th className="py-3 px-4 text-center">Status</th>

              {/* Created Date */}
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSort && onSort('createdAt')}
                  className="flex items-center gap-1.5 hover:text-[#0F172A] cursor-pointer group"
                >
                  <span>Created Date</span>
                  {renderSortIndicator('createdAt')}
                </button>
              </th>

              {/* Actions */}
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {suppliers.map((s) => {
              const isActive = Boolean(s.isActive ?? s.is_active);

              return (
                <tr
                  key={s.id}
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  {/* Supplier */}
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#1769C2] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          onClick={() => navigate(`/suppliers/${s.id}`)}
                          className="hover:text-[#1769C2] cursor-pointer truncate transition font-bold"
                          title={s.name}
                        >
                          {s.name}
                        </p>
                        <p className="text-[11px] text-[#64748B] font-normal truncate">
                          {s.city ? `${s.city}${s.state ? `, ${s.state}` : ''}` : 'Location unassigned'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact Person */}
                  <td className="py-3.5 px-4 text-[#0F172A] font-medium">
                    {s.contactPerson || s.contact_person || s.contactName || (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {s.email ? (
                      <a
                        href={`mailto:${s.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-[#1769C2] transition"
                        title={s.email}
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[140px]">{s.email}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                    {s.phone ? (
                      <div className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Products */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Package className="w-3 h-3 text-slate-500" />
                      <span>{s.productsCount ?? 0}</span>
                    </span>
                  </td>

                  {/* Active Orders */}
                  <td className="py-3.5 px-4 text-center">
                    {Number(s.activeOrdersCount ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1769C2] border border-blue-200">
                        <ShoppingCart className="w-3 h-3" />
                        <span>{s.activeOrdersCount}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <SupplierStatusBadge isActive={isActive} size="xs" />
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                    {formatDate(s.createdAt || s.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() => navigate(`/suppliers/${s.id}`)}
                        className="p-1.5 rounded-lg border border-[#D9E2EC] bg-white text-[#64748B] hover:text-[#1769C2] hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
                        title="View Supplier Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button (MANAGER only) */}
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(s)}
                          className="p-1.5 rounded-lg border border-[#D9E2EC] bg-white text-[#64748B] hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition cursor-pointer"
                          title="Edit Supplier Information"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Activate / Deactivate Button (MANAGER only) */}
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus && onToggleStatus(s)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isActive
                              ? 'border-slate-200 bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={isActive ? 'Deactivate Supplier (Soft Deactivate)' : 'Activate Supplier'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
