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
import ProductStatusBadge from '../components/products/ProductStatusBadge.jsx';
import ProductModal from '../components/products/ProductModal.jsx';
import ProductForm from '../components/products/ProductForm.jsx';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [product, setProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
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
      const [prodData, supData] = await Promise.all([
        productService.getProduct(id),
        productService.getSuppliers()
      ]);
      setProduct(prodData);
      setSuppliers(supData);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-300">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{error || 'Product not found'}</h2>
        <p className="text-xs text-slate-400">
          The requested product SKU could not be found or has been removed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        {isManager && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setFormError(null);
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>

            {!isInactive && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Title and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {product.name}
              </h1>
              <ProductStatusBadge status={product.stockStatus} />
            </div>
            <p className="font-mono text-xs text-indigo-400 mt-1">
              SKU: {product.sku}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/70 text-slate-200 border border-slate-600/50">
              {product.category}
            </span>
            {isInactive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                Inactive
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
            {product.description}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Stock
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  product.currentStock === 0
                    ? 'text-red-400'
                    : product.currentStock <= product.minimumStock
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {product.currentStock}
              </span>
              <span className="text-xs text-slate-400">{product.unit}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Minimum Stock Threshold
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-200">
                {product.minimumStock}
              </span>
              <span className="text-xs text-slate-400">{product.unit}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Unit Price
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 block">
              ${Number(product.price || 0).toFixed(2)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Supplier
            </span>
            <p className="text-sm font-semibold text-white truncate">
              {product.supplier?.name || 'None Assigned'}
            </p>
          </div>
        </div>

        {/* Supplier Contact Details if available */}
        {product.supplier && (
          <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-700/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Supplier Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Company:</span>
                <span className="text-slate-200 font-medium">{product.supplier.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email:</span>
                <span className="text-slate-200 font-medium">{product.supplier.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <span className="text-slate-200 font-medium">{product.supplier.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-700/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
          </span>
        </div>
      </div>

      {/* Inventory History Roadmap Placeholder */}
      <div className="bg-slate-800/50 border border-dashed border-slate-700/70 rounded-2xl p-6 text-center space-y-2">
        <History className="w-6 h-6 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">Inventory Audit History</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Detailed stock transactions, simulated sensor readings, and replenishment logs will be available in subsequent phases.
        </p>
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
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <p className="font-semibold text-red-300 mb-1">
                Are you sure you want to deactivate "{product.name}"?
              </p>
              <p className="text-slate-400">
                This product will be archived and hidden from the default active catalog. Historical records will be safely preserved.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition cursor-pointer"
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
