import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  Power,
  Package,
  ShoppingCart,
  Boxes,
  CheckCircle2,
  Clock3,
  Truck,
  RotateCcw,
  Ban,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SupplierStatusBadge from '../components/suppliers/SupplierStatusBadge.jsx';
import SupplierProductTable from '../components/suppliers/SupplierProductTable.jsx';
import SupplierRestockTable from '../components/suppliers/SupplierRestockTable.jsx';
import SupplierFormModal from '../components/suppliers/SupplierFormModal.jsx';
import DeactivateSupplierModal from '../components/suppliers/DeactivateSupplierModal.jsx';
import {
  getSupplier,
  getSupplierProducts,
  getSupplierRestockOrders,
  updateSupplierStatus
} from '../services/supplier.service.js';

export default function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // State
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);

  // Active section tab: 'products' | 'orders'
  const [activeTab, setActiveTab] = useState('products');

  const fetchSupplierData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [supplierRes, productsRes, ordersRes] = await Promise.all([
        getSupplier(id),
        getSupplierProducts(id),
        getSupplierRestockOrders(id)
      ]);

      setSupplier(supplierRes.supplier || supplierRes.data);
      setProducts(productsRes.products || productsRes.data || []);
      setOrders(ordersRes.orders || ordersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load supplier details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);

  const handleConfirmStatusToggle = async (supp, targetActive) => {
    try {
      setStatusToggling(true);
      await updateSupplierStatus(supp.id, targetActive);
      setIsStatusModalOpen(false);
      toast.success(
        `Supplier '${supp.name}' ${targetActive ? 'activated' : 'deactivated'} successfully.`
      );
      fetchSupplierData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update supplier status.');
    } finally {
      setStatusToggling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading supplier details...</p>
        <p className="text-xs text-[#64748B]">Connecting inventory relationships and purchase orders</p>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#0F172A]">Supplier Not Found</h2>
        <p className="text-xs text-[#64748B]">
          {error || 'The requested supplier does not exist or may have been archived.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Suppliers</span>
        </button>
      </div>
    );
  }

  const stats = supplier.statistics || {};
  const isCurrentlyActive = Boolean(supplier.isActive ?? supplier.is_active);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Back Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#1769C2] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Suppliers</span>
        </button>

        {isManager && (
          <div className="flex items-center gap-2">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-[#D9E2EC] hover:bg-slate-50 rounded-xl transition shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Supplier</span>
            </button>

            {/* Activate / Deactivate Button */}
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition shadow-2xs ${
                isCurrentlyActive
                  ? 'text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                  : 'text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isCurrentlyActive ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Supplier Profile Card */}
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#1769C2] flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                    {supplier.name}
                  </h1>
                  <SupplierStatusBadge isActive={isCurrentlyActive} size="sm" />
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Lead Time:{' '}
                  <span className="font-bold text-[#0F172A]">
                    {supplier.leadTimeDays ?? supplier.lead_time_days ?? 3} days
                  </span>
                </p>
              </div>
            </div>

            {/* Contact & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
              {/* Contact Person */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">
                  Contact Person
                </span>
                <span className="font-semibold text-[#0F172A]">
                  {supplier.contactPerson || supplier.contact_person || supplier.contactName || 'Unassigned'}
                </span>
              </div>

              {/* Email */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">
                  Email
                </span>
                {supplier.email ? (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="font-semibold text-[#1769C2] hover:underline flex items-center gap-1.5 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 font-normal">—</span>
                )}
              </div>

              {/* Phone */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">
                  Phone
                </span>
                {supplier.phone ? (
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{supplier.phone}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">—</span>
                )}
              </div>

              {/* Physical Address */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">
                  Address
                </span>
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {[
                      supplier.address,
                      supplier.city,
                      supplier.state,
                      supplier.postalCode || supplier.postal_code,
                      supplier.country
                    ]
                      .filter(Boolean)
                      .join(', ') || 'No address provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes if available */}
            {supplier.notes && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                <div className="flex items-center gap-1.5 text-[#1769C2] font-bold mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Vendor Notes</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{supplier.notes}</p>
              </div>
            )}
          </div>

          {/* Audit Metadata Sidebar Card */}
          <div className="lg:w-64 p-4 rounded-xl bg-slate-50 border border-[#D9E2EC] text-xs text-[#64748B] space-y-2.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block border-b border-slate-200 pb-1.5">
              Record Audit
            </span>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created:</span>
              </span>
              <span className="font-semibold text-[#0F172A]">
                {formatDate(supplier.createdAt || supplier.created_at)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated:</span>
              </span>
              <span className="font-semibold text-[#0F172A]">
                {formatDate(supplier.updatedAt || supplier.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Statistics Section (Section 18) */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Supplier Statistics
          </h2>
          <p className="text-xs text-[#64748B]">
            Real-time aggregates calculated from active product catalog and purchase order history
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Products */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D9E2EC] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block truncate">
              Total Products
            </span>
            <p className="text-xl font-extrabold text-[#0F172A] mt-1">
              {stats.totalProducts ?? 0}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              {stats.activeProducts ?? 0} active in store
            </span>
          </div>

          {/* Total Restock Orders */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D9E2EC] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block truncate">
              Total Orders
            </span>
            <p className="text-xl font-extrabold text-[#0F172A] mt-1">
              {stats.totalRestockOrders ?? 0}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              Lifetime purchase orders
            </span>
          </div>

          {/* Pending Orders */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D9E2EC] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block truncate">
              Pending Orders
            </span>
            <p className="text-xl font-extrabold text-amber-700 mt-1">
              {stats.pendingOrders ?? 0}
            </p>
            <span className="text-[10px] text-amber-600 font-medium">
              Awaiting transmission
            </span>
          </div>

          {/* Ordered Orders */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D9E2EC] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block truncate">
              Ordered Orders
            </span>
            <p className="text-xl font-extrabold text-blue-700 mt-1">
              {stats.orderedOrders ?? 0}
            </p>
            <span className="text-[10px] text-blue-600 font-medium">
              In transit / confirmed
            </span>
          </div>

          {/* Received Orders */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D9E2EC] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block truncate">
              Received Orders
            </span>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">
              {stats.receivedOrders ?? 0}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              Completed stock-ins
            </span>
          </div>

          {/* Cancelled Orders */}
          <div className="p-3.5 rounded-xl bg-white border border-[#D9E2EC] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
              Cancelled Orders
            </span>
            <p className="text-xl font-extrabold text-slate-600 mt-1">
              {stats.cancelledOrders ?? 0}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">
              Voided before receipt
            </span>
          </div>
        </div>

        {/* Volume Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1769C2]">
                Total Units Ordered
              </span>
              <p className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                {stats.totalUnitsOrdered ?? 0}
              </p>
              <p className="text-[11px] text-[#64748B]">All active and completed orders</p>
            </div>
            <Boxes className="w-8 h-8 text-[#1769C2]/40" />
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Total Units Received
              </span>
              <p className="text-2xl font-extrabold text-emerald-800 mt-0.5">
                {stats.totalUnitsReceived ?? 0}
              </p>
              <p className="text-[11px] text-emerald-700/80">Successfully restocked to shelf</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-600/40" />
          </div>
        </div>
      </div>

      {/* Tabs for Products Supplied & Restock Orders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Supplied ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Restock Orders ({orders.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Products Supplied by {supplier.name}
              </span>
            </div>
            <SupplierProductTable products={products} loading={loading} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Restock Purchase Orders for {supplier.name}
              </span>
            </div>
            <SupplierRestockTable orders={orders} loading={loading} />
          </div>
        )}
      </div>

      {/* Edit Supplier Modal */}
      <SupplierFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          fetchSupplierData();
        }}
        initialData={supplier}
        isEdit={true}
      />

      {/* Deactivate / Activate Modal */}
      <DeactivateSupplierModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        supplier={supplier}
        loading={statusToggling}
      />
    </div>
  );
}
