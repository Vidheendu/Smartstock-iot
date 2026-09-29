import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import RestockSummaryCards from '../components/restock/RestockSummaryCards.jsx';
import ProductsNeedingRestock from '../components/restock/ProductsNeedingRestock.jsx';
import RestockTable from '../components/restock/RestockTable.jsx';
import RestockOrderFormModal from '../components/restock/RestockOrderFormModal.jsx';
import RestockOrderDetailsModal from '../components/restock/RestockOrderDetailsModal.jsx';
import {
  getRestockOrders,
  getRestockOrder,
  getRestockSummary,
  getProductsNeedingRestock,
  markRestockOrdered,
  receiveRestockOrder,
  cancelRestockOrder
} from '../services/restock.service.js';
import { getSuppliers } from '../services/product.service.js';

export default function Restocking() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const { id: routeOrderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [needingRestock, setNeedingRestock] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingNeeding, setLoadingNeeding] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load summary & needing restock
  const fetchAuxiliaryData = useCallback(async () => {
    try {
      setLoadingSummary(true);
      setLoadingNeeding(true);

      const [sumRes, needRes, supRes] = await Promise.all([
        getRestockSummary(),
        getProductsNeedingRestock(),
        getSuppliers()
      ]);

      setSummary(sumRes.summary || null);
      setNeedingRestock(needRes.products || []);
      setSuppliers(Array.isArray(supRes) ? supRes : (supRes?.data || []));
    } catch (err) {
      console.error('[RESTOCK PAGE] Failed to load summary or recommendations:', err);
    } finally {
      setLoadingSummary(false);
      setLoadingNeeding(false);
    }
  }, []);

  // Load restock orders with filters
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      setError(null);

      const filters = {
        status: filterStatus,
        supplierId: filterSupplier,
        search: searchQuery,
        sortBy,
        sortOrder
      };

      const res = await getRestockOrders(filters);
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load restock orders.');
    } finally {
      setLoadingOrders(false);
    }
  }, [filterStatus, filterSupplier, searchQuery, sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    fetchAuxiliaryData();
  }, [fetchAuxiliaryData]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Check URL query parameters for pre-filling restock order (e.g. from Forecast page)
  useEffect(() => {
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');
    const quantity = searchParams.get('quantity');

    if (action === 'new' && productId) {
      setIsEditMode(false);
      setFormData({
        prefillProduct: {
          productId,
          suggestedQuantity: quantity ? parseInt(quantity, 10) : 10
        }
      });
      setIsFormOpen(true);
      // Clear query params to prevent reopening on reload
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Automatically open details modal if navigated to /restocking/:id
  useEffect(() => {
    if (routeOrderId) {
      const found = orders.find((o) => o.id === routeOrderId || o.orderNumber === routeOrderId);
      if (found) {
        setSelectedOrder(found);
        setIsDetailsOpen(true);
      } else {
        getRestockOrder(routeOrderId)
          .then((res) => {
            if (res.order) {
              setSelectedOrder(res.order);
              setIsDetailsOpen(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [routeOrderId, orders]);

  // Handle Quick Sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Card click filtering
  const handleCardClick = (cardId) => {
    if (cardId === 'NEEDING_RESTOCK') {
      // Scroll to or keep focus on needing restock section
      return;
    }
    setFilterStatus(cardId === filterStatus ? 'ALL' : cardId);
  };

  // Restock specific product from Needing Restock list
  const handleRestockProduct = (product) => {
    setIsEditMode(false);
    setFormData({
      supplierId: product.supplierId || '',
      prefillProduct: {
        productId: product.productId,
        suggestedQuantity: product.suggestedQuantity,
        price: product.price
      }
    });
    setIsFormOpen(true);
  };

  // Quick Action Handlers
  const handleOrderOrder = async (order) => {
    try {
      await markRestockOrdered(order.id);
      fetchOrders();
      fetchAuxiliaryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleReceiveOrder = async (order) => {
    if (!window.confirm(`Mark order ${order.orderNumber} as RECEIVED? Product inventory will be increased.`)) return;
    try {
      await receiveRestockOrder(order.id);
      fetchOrders();
      fetchAuxiliaryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to receive restock order');
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Cancel restock order ${order.orderNumber}?`)) return;
    try {
      await cancelRestockOrder(order.id, 'User cancelled from order list');
      fetchOrders();
      fetchAuxiliaryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Restocking
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Create and manage inventory restock orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              fetchOrders();
              fetchAuxiliaryData();
            }}
            className="p-2.5 rounded-xl border border-[#D9E2EC] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh Restocking Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isManager && (
            <button
              type="button"
              onClick={() => {
                setIsEditMode(false);
                setFormData(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1769C2] hover:bg-[#12539A] shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Create Restock Order
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            className="font-bold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <RestockSummaryCards
        summary={summary}
        loading={loadingSummary}
        onCardClick={handleCardClick}
        selectedFilter={filterStatus}
      />

      {/* Products Needing Restock Section */}
      <ProductsNeedingRestock
        products={needingRestock}
        loading={loadingNeeding}
        onRestockProduct={handleRestockProduct}
        isManager={isManager}
      />

      {/* Restock Order List Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Restock Purchase Orders
            </h2>
            <p className="text-xs text-[#64748B]">
              Track procurement orders from draft through receiving and stock replenishment
            </p>
          </div>
        </div>

        <RestockTable
          orders={orders}
          loading={loadingOrders}
          suppliers={suppliers}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterSupplier={filterSupplier}
          setFilterSupplier={setFilterSupplier}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isManager={isManager}
          onViewOrder={(order) => {
            setSelectedOrder(order);
            setIsDetailsOpen(true);
          }}
          onEditOrder={(order) => {
            setFormData(order);
            setIsEditMode(true);
            setIsFormOpen(true);
          }}
          onOrderOrder={handleOrderOrder}
          onReceiveOrder={handleReceiveOrder}
          onCancelOrder={handleCancelOrder}
        />
      </div>

      {/* Create / Edit Modal */}
      <RestockOrderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchOrders();
          fetchAuxiliaryData();
        }}
        initialData={formData}
        isEdit={isEditMode}
      />

      {/* Details Modal */}
      <RestockOrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        order={selectedOrder}
        isManager={isManager}
        onActionSuccess={() => {
          fetchOrders();
          fetchAuxiliaryData();
        }}
        onEditClick={(order) => {
          setFormData(order);
          setIsEditMode(true);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
}
