import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import SupplierSummaryCards from '../components/suppliers/SupplierSummaryCards.jsx';
import SupplierTable from '../components/suppliers/SupplierTable.jsx';
import SupplierFormModal from '../components/suppliers/SupplierFormModal.jsx';
import DeactivateSupplierModal from '../components/suppliers/DeactivateSupplierModal.jsx';
import {
  getSuppliers,
  updateSupplierStatus
} from '../services/supplier.service.js';

export default function Suppliers() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // Suppliers & Pagination State
  const [suppliers, setSuppliers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hasActiveOrdersFilter, setHasActiveOrdersFilter] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [supplierToToggle, setSupplierToToggle] = useState(null);
  const [statusToggling, setStatusToggling] = useState(false);

  // Search Debouncing (350ms)
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  // Fetch Suppliers from API
  const fetchSuppliersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: debouncedSearch,
        status: statusFilter,
        hasActiveOrders: hasActiveOrdersFilter ? 'true' : '',
        sort: sortBy,
        order: sortOrder,
        page: currentPage,
        limit: 10
      };

      const res = await getSuppliers(params);

      setSuppliers(res.data || []);
      if (res.summary) setSummary(res.summary);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, hasActiveOrdersFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchSuppliersData();
  }, [fetchSuppliersData]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle Card Click for Quick Filtering
  const handleCardClick = (cardId) => {
    setCurrentPage(1);
    if (cardId === 'TOTAL') {
      setStatusFilter('ALL');
      setHasActiveOrdersFilter(false);
    } else if (cardId === 'ACTIVE') {
      setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE');
      setHasActiveOrdersFilter(false);
    } else if (cardId === 'INACTIVE') {
      setStatusFilter(statusFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE');
      setHasActiveOrdersFilter(false);
    } else if (cardId === 'ACTIVE_ORDERS') {
      setHasActiveOrdersFilter(!hasActiveOrdersFilter);
    }
  };

  // Create Supplier
  const handleAddSupplier = () => {
    setIsEditMode(false);
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  // Edit Supplier
  const handleEditSupplier = (supplier) => {
    setIsEditMode(true);
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  // Status Toggle
  const handleOpenStatusModal = (supplier) => {
    setSupplierToToggle(supplier);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusToggle = async (supplier, targetActive) => {
    try {
      setStatusToggling(true);
      await updateSupplierStatus(supplier.id, targetActive);
      setIsStatusModalOpen(false);
      setSupplierToToggle(null);
      setSuccessMessage(
        `Supplier '${supplier.name}' ${targetActive ? 'activated' : 'deactivated'} successfully.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchSuppliersData();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update supplier status.');
    } finally {
      setStatusToggling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Suppliers
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage suppliers and track their inventory relationships.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSuppliersData}
            className="p-2.5 rounded-xl border border-[#D9E2EC] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title="Refresh Suppliers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isManager && (
            <button
              type="button"
              onClick={handleAddSupplier}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchSuppliersData}
            className="font-bold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <SupplierSummaryCards
        summary={summary}
        loading={loading}
        selectedStatus={statusFilter}
        hasActiveOrdersFilter={hasActiveOrdersFilter}
        onCardClick={handleCardClick}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E2EC] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search suppliers by name, contact, email, or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] transition"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>

            {/* Has Active Orders Toggle */}
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs font-semibold text-[#0F172A] cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={hasActiveOrdersFilter}
                onChange={(e) => {
                  setHasActiveOrdersFilter(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-3.5 h-3.5 text-[#1769C2] rounded border-slate-300 focus:ring-[#1769C2]"
              />
              <span>Has Active Orders</span>
            </label>

            {/* Sort Selection */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(dir);
                setCurrentPage(1);
              }}
              className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] cursor-pointer"
            >
              <option value="name-asc">Supplier Name (A–Z)</option>
              <option value="name-desc">Supplier Name (Z–A)</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="products-desc">Most Products</option>
              <option value="activeOrders-desc">Most Active Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supplier Table */}
      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEditSupplier}
        onToggleStatus={handleOpenStatusModal}
        onAddNew={handleAddSupplier}
        isManager={isManager}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-[#64748B]">
          <p>
            Showing{' '}
            <span className="font-bold text-[#0F172A]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#0F172A]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-[#0F172A]">{pagination.total}</span> suppliers
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E2EC] bg-white text-[#0F172A] hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-[#0F172A]">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E2EC] bg-white text-[#0F172A] hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchSuppliersData();
          setSuccessMessage(
            isEditMode
              ? 'Supplier updated successfully.'
              : 'New supplier registered successfully.'
          );
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
        initialData={selectedSupplier}
        isEdit={isEditMode}
      />

      {/* Status Toggle Modal */}
      <DeactivateSupplierModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSupplierToToggle(null);
        }}
        onConfirm={handleConfirmStatusToggle}
        supplier={supplierToToggle}
        loading={statusToggling}
      />
    </div>
  );
}
