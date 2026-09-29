import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Edit3,
  Trash2,
  Building2,
  Clock,
  Calendar,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Loader2,
  AlertCircle,
  History,
  TrendingDown,
  RadioTower,
  Bell,
  ShoppingCart,
  Boxes,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import productService, { getProductDetails } from '../services/product.service.js';
import ProductStatusBadge from '../components/products/ProductStatusBadge.jsx';
import ProductModal from '../components/products/ProductModal.jsx';
import ProductForm from '../components/products/ProductForm.jsx';
import StockLevelIndicator from '../components/products/StockLevelIndicator.jsx';
import StockMovementChart from '../components/products/StockMovementChart.jsx';
import ProductInventoryHistory from '../components/products/ProductInventoryHistory.jsx';
import ProductForecastCard from '../components/products/ProductForecastCard.jsx';
import IoTMonitoringCard from '../components/products/IoTMonitoringCard.jsx';
import ProductAlertsCard from '../components/products/ProductAlertsCard.jsx';
import ProductRestockCard from '../components/products/ProductRestockCard.jsx';
import ProductActivityTimeline from '../components/products/ProductActivityTimeline.jsx';
import StockActionModal from '../components/products/StockActionModal.jsx';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // Consolidated Product Details state
  const [details, setDetails] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Stock In / Out Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalMode, setStockModalMode] = useState('STOCK_IN');

  // Edit Product Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Deactivate Product Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load consolidated details
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [detailsData, supData] = await Promise.all([
        getProductDetails(id),
        productService.getSuppliers().catch(() => [])
      ]);

      setDetails(detailsData);
      setSuppliers(Array.isArray(supData) ? supData : (supData?.data || []));
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Unable to load product details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stock In / Out Success handler (immediately refreshes all details)
  const handleStockSuccess = async () => {
    await loadData();
    setHistoryRefreshKey((prev) => prev + 1);
  };

  // Edit Product Submission handler
  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await productService.updateProduct(id, formData);
      await loadData();
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deactivate Product handler
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(id);
      setIsDeleteModalOpen(false);
      navigate('/products', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate product');
    } finally {
      setIsDeleting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading product details...</p>
        <p className="text-xs text-[#64748B]">Retrieving inventory, telemetry, forecast, and activity data</p>
      </div>
    );
  }

  // 2. Error / Product Not Found State
  if (error || !details || !details.product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F172A]">Product not found</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The requested product could not be found or has been removed from the system.
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const { product, inventory, supplier, iotDevice, telemetry, alerts, forecast, restockOrders, suggestedRestockQuantity, stockMovement, activityTimeline } = details;
  const isInactive = product.isActive === false;

  return (
    <div className="space-y-6 pb-12">
      {/* --------------------------------------------------
          1. PRODUCT HEADER: Name / SKU / Status / Actions
         -------------------------------------------------- */}
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>

          <span className="text-[11px] font-mono text-[#64748B]">
            Product ID: <span className="text-[#0F172A] font-semibold">{product.id}</span>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                {product.name}
              </h1>
              <ProductStatusBadge status={product.stockStatus} />
              {isInactive ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  INACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-emerald-800 border border-emerald-300">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
              <span className="font-mono font-semibold text-[#1769C2]">
                SKU: {product.sku}
              </span>
              <span>•</span>
              <span className="font-medium text-[#0F172A]">
                Category: <strong>{product.category}</strong>
              </span>
              <span>•</span>
              <span className="font-medium text-[#0F172A]">
                Supplier:{' '}
                {supplier ? (
                  <Link
                    to={`/suppliers/${supplier.id}`}
                    className="text-[#1769C2] hover:underline font-semibold"
                  >
                    {supplier.name}
                  </Link>
                ) : (
                  <span className="text-[#64748B] italic">No supplier assigned</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Stock In (Available to all authorized roles) */}
            <button
              onClick={() => {
                setStockModalMode('STOCK_IN');
                setIsStockModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Stock In</span>
            </button>

            {/* Stock Out (Available to all authorized roles) */}
            <button
              onClick={() => {
                setStockModalMode('STOCK_OUT');
                setIsStockModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer shadow-2xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#1769C2]" />
              <span>Stock Out</span>
            </button>

            {/* Manager-only: Edit Product */}
            {isManager && (
              <button
                onClick={() => {
                  setFormError(null);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1769C2]" />
                <span>Edit Product</span>
              </button>
            )}

            {/* Manager-only: Deactivate Product */}
            {isManager && !isInactive && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white rounded-xl transition cursor-pointer shadow-2xs"
                title="Deactivate product"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          2. CURRENT INVENTORY SUMMARY & STOCK LEVEL VISUALIZATION
         -------------------------------------------------- */}
      <div className="space-y-4">
        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Stock */}
          <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Current Stock
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  product.currentStock === 0
                    ? 'text-rose-600'
                    : product.currentStock <= product.minimumStock
                    ? 'text-amber-600'
                    : 'text-[#0F172A]'
                }`}
              >
                {product.currentStock}
              </span>
              <span className="text-xs font-semibold text-[#64748B]">{product.unit}</span>
            </div>
          </div>

          {/* Minimum Stock */}
          <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Minimum Stock
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                {product.minimumStock}
              </span>
              <span className="text-xs font-semibold text-[#64748B]">{product.unit}</span>
            </div>
          </div>

          {/* Unit */}
          <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Measurement Unit
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] block capitalize">
              {product.unit}
            </span>
          </div>

          {/* Stock Status */}
          <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Stock Status
            </span>
            <div className="pt-1">
              <ProductStatusBadge status={product.stockStatus} />
            </div>
          </div>
        </div>

        {/* Stock Level Visualization (Progress bar with minimum threshold pin) */}
        <StockLevelIndicator
          currentStock={product.currentStock}
          minimumStock={product.minimumStock}
          unit={product.unit}
          status={product.stockStatus}
        />
      </div>

      {/* --------------------------------------------------
          3. PRODUCT INFORMATION & SUPPLIER INFORMATION
         -------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Information */}
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1769C2]" />
              <span>Product Information</span>
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">
              ${Number(product.price || 0).toFixed(2)} / {product.unit}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {product.description && (
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] text-[#0F172A] leading-relaxed">
                {product.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Name</span>
                <span className="font-semibold text-[#0F172A]">{product.name}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">SKU</span>
                <span className="font-mono font-semibold text-[#1769C2]">{product.sku}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Category</span>
                <span className="font-semibold text-[#0F172A]">{product.category}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Unit Price</span>
                <span className="font-bold text-emerald-700">${Number(product.price || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Active Status</span>
                <span className={`font-semibold ${isInactive ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isInactive ? 'INACTIVE' : 'ACTIVE'}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Measurement Unit</span>
                <span className="font-semibold text-[#0F172A]">{product.unit}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Created Date</span>
                <span className="text-[#64748B]">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Updated Date</span>
                <span className="text-[#64748B]">{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Supplier Information */}
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1769C2]" />
              <span>Supplier Information</span>
            </h3>

            {supplier && (
              <Link
                to={`/suppliers/${supplier.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-[#dbeafe] border border-[#BFDBFE] rounded-xl transition cursor-pointer shadow-2xs"
              >
                <span>View Supplier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {!supplier ? (
            <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-1">
              <Building2 className="w-6 h-6 text-[#64748B] mx-auto" />
              <p className="text-xs font-semibold text-[#0F172A]">No supplier assigned</p>
              <p className="text-[11px] text-[#64748B]">
                This product does not have an associated supplier record configured.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Supplier Company
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      supplier.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {supplier.status}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#0F172A]">
                  {supplier.name}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Contact Person</span>
                  <span className="font-semibold text-[#0F172A]">{supplier.contactPerson || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Email</span>
                  <span className="font-semibold text-[#0F172A] truncate block">{supplier.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Phone</span>
                  <span className="font-semibold text-[#0F172A]">{supplier.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Lead Time</span>
                  <span className="font-semibold text-[#0F172A]">
                    {supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------
          4. STOCK MOVEMENT CHART (Recharts)
         -------------------------------------------------- */}
      <StockMovementChart
        stockMovement={stockMovement}
        unit={product.unit}
        minimumStock={product.minimumStock}
      />

      {/* --------------------------------------------------
          5. INVENTORY HISTORY (Filtered & Paginated)
         -------------------------------------------------- */}
      <ProductInventoryHistory
        productId={product.id}
        unit={product.unit}
        refreshKey={historyRefreshKey}
      />

      {/* --------------------------------------------------
          6. FORECAST SECTION (Consumption + Projections)
         -------------------------------------------------- */}
      <ProductForecastCard
        forecast={forecast}
        currentStock={product.currentStock}
        unit={product.unit}
      />

      {/* --------------------------------------------------
          7. IOT MONITORING SECTION
         -------------------------------------------------- */}
      <IoTMonitoringCard
        iotDevice={iotDevice}
        telemetry={telemetry}
        unit={product.unit}
      />

      {/* --------------------------------------------------
          8. PRODUCT ALERTS SECTION
         -------------------------------------------------- */}
      <ProductAlertsCard
        alerts={alerts}
        onAlertUpdated={loadData}
      />

      {/* --------------------------------------------------
          9. RESTOCK ORDERS SECTION
         -------------------------------------------------- */}
      <ProductRestockCard
        restockOrders={restockOrders}
        product={product}
        suggestedQuantity={suggestedRestockQuantity}
        isManager={isManager}
        unit={product.unit}
      />

      {/* --------------------------------------------------
          10. RECENT ACTIVITY TIMELINE
         -------------------------------------------------- */}
      <ProductActivityTimeline activities={activityTimeline} />

      {/* --------------------------------------------------
          MODALS
         -------------------------------------------------- */}

      {/* Stock In / Out Modal */}
      <StockActionModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        mode={stockModalMode}
        product={product}
        onSuccess={handleStockSuccess}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        <ProductForm
          initialData={product}
          suppliers={suppliers}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={isSubmitting}
          serverError={formError}
        />
      </ProductModal>

      {/* Deactivate Product Confirmation Modal */}
      <ProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate Product"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-[#0F172A]">
              <p className="font-semibold text-red-700 mb-1">
                Are you sure you want to deactivate "{product.name}"?
              </p>
              <p className="text-[#64748B]">
                This product will be archived and hidden from the default active catalog. Historical records, IoT telemetry, alerts, and restock orders will be safely preserved.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 border border-[#D9E2EC] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Deactivate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </ProductModal>
    </div>
  );
};

export default ProductDetails;
