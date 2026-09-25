import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowLeft,
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
  History
} from 'lucide-react';
import productService from '../services/product.service.js';
import inventoryService from '../services/inventory.service.js';
import ProductStatusBadge from '../components/products/ProductStatusBadge.jsx';
import ProductModal from '../components/products/ProductModal.jsx';
import ProductForm from '../components/products/ProductForm.jsx';
import { TRANSACTION_CONFIG } from '../utils/inventoryConstants.js';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [product, setProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal & Delete state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [prodData, supData, histData] = await Promise.all([
        productService.getProduct(id),
        productService.getSuppliers(),
        inventoryService.getProductHistory(id).catch(() => [])
      ]);
      setProduct(prodData);
      setSuppliers(supData);
      setRecentHistory(histData || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found.');
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

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const updated = await productService.updateProduct(id, formData);
      setProduct(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(id);
      setIsDeleteModalOpen(false);
      navigate('/products', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-medium text-[#64748B]">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#102A43]">{error || 'Product not found'}</h2>
        <p className="text-xs text-[#64748B]">
          The requested product SKU could not be found or has been removed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const isInactive = product.isActive === false;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/inventory/history?productId=${product.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1769C2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-[#1769C2]" />
            <span>View Inventory History</span>
          </Link>

          {isManager && (
            <>
              <button
                onClick={() => {
                  setFormError(null);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#102A43] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1769C2]" />
                <span>Edit Product</span>
              </button>

              {!isInactive && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 bg-white rounded-xl transition cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Deactivate</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102A43]">
                {product.name}
              </h1>
              <ProductStatusBadge status={product.stockStatus} />
            </div>
            <p className="font-mono text-xs text-[#1769C2] mt-1 font-semibold">
              SKU: {product.sku}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#102A43] border border-slate-200">
              {product.category}
            </span>
            {isInactive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                Inactive
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="p-4 bg-[#F4F8FC] rounded-xl border border-[#E2E8F0] text-xs text-[#102A43] leading-relaxed">
            {product.description}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Current Stock
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  product.currentStock === 0
                    ? 'text-red-600'
                    : product.currentStock <= product.minimumStock
                    ? 'text-amber-600'
                    : 'text-[#102A43]'
                }`}
              >
                {product.currentStock}
              </span>
              <span className="text-xs text-[#64748B]">{product.unit}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Minimum Stock Threshold
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#102A43]">
                {product.minimumStock}
              </span>
              <span className="text-xs text-[#64748B]">{product.unit}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Unit Price
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600 block">
              ${Number(product.price || 0).toFixed(2)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Assigned Supplier
            </span>
            <p className="text-sm font-semibold text-[#102A43] truncate">
              {product.supplier?.name || 'None Assigned'}
            </p>
          </div>
        </div>

        {/* Supplier Contact Details if available */}
        {product.supplier && (
          <div className="p-5 bg-[#F4F8FC] rounded-xl border border-[#E2E8F0] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1769C2]" />
              <span>Supplier Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#64748B] block">Company:</span>
                <span className="text-[#102A43] font-medium">{product.supplier.name}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Email:</span>
                <span className="text-[#102A43] font-medium">{product.supplier.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Phone:</span>
                <span className="text-[#102A43] font-medium">{product.supplier.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-3 border-t border-[#E2E8F0]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
          </span>
        </div>
      </div>

      {/* Inventory Audit History Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <History className="w-4 h-4 text-[#1769C2]" />
              <span>Inventory Audit History</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Recent recorded stock adjustments and movements for {product.name}.
            </p>
          </div>

          <Link
            to={`/inventory/history?productId=${product.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-blue-50 hover:bg-blue-100 rounded-lg transition self-start sm:self-auto border border-blue-200"
          >
            <span>View Full History ({recentHistory.length})</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {recentHistory.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-[#F4F8FC] rounded-xl border border-dashed border-[#CBD5E1]">
            <p className="text-xs text-[#64748B]">
              No inventory history recorded yet for this product.
            </p>
            <Link
              to="/inventory"
              className="inline-block text-xs font-semibold text-[#1769C2] hover:underline"
            >
              Go to Inventory to record Stock In or Stock Out
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Change</th>
                  <th className="py-2.5 px-3 text-center">Flow</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentHistory.slice(0, 5).map((item) => {
                  const isPositive = Number(item.quantityChange) > 0;
                  const isNegative = Number(item.quantityChange) < 0;
                  const config =
                    TRANSACTION_CONFIG[item.changeType] || TRANSACTION_CONFIG.ADJUSTMENT;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/75">
                      <td className="py-2.5 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}{' '}
                        {new Date(item.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-700'
                              : isNegative
                              ? 'text-[#1769C2]'
                              : 'text-[#64748B]'
                          }
                        >
                          {isPositive ? `+${item.quantityChange}` : item.quantityChange}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#64748B]">
                        {item.previousStock} &rarr;{' '}
                        <strong className="text-[#102A43]">{item.newStock}</strong>
                      </td>
                      <td className="py-2.5 px-3 text-[#102A43] max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] text-[11px]">
                        {item.performedBy?.name || 'Staff User'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <ProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate Product"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-[#102A43]">
              <p className="font-semibold text-red-700 mb-1">
                Are you sure you want to deactivate "{product.name}"?
              </p>
              <p className="text-[#64748B]">
                This product will be archived and hidden from the default active catalog. Historical records will be safely preserved.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
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
                  <span>Deleting...</span>
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
