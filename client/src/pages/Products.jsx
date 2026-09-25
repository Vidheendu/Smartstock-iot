import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PackagePlus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Package,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import productService from '../services/product.service.js';
import ProductTable from '../components/products/ProductTable.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import ProductFilters from '../components/products/ProductFilters.jsx';
import ProductModal from '../components/products/ProductModal.jsx';
import ProductForm from '../components/products/ProductForm.jsx';

export const Products = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // Data state
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('true'); // 'true', 'all', 'false'
  const [sortBy, setSortBy] = useState('created_desc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirmation state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products & suppliers from backend API
  const fetchProductsData = useCallback(async () => {
    try {
      setError(null);
      const [prodsData, supsData] = await Promise.all([
        productService.getProducts({ isActive: activeFilter }),
        productService.getSuppliers()
      ]);
      setProducts(prodsData);
      setSuppliers(supsData);
    } catch (err) {
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // Client-side search, filtering, and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== 'ALL') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Stock Status filter
    if (status !== 'ALL') {
      result = result.filter((p) => p.stockStatus === status);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'stock_asc':
          return a.currentStock - b.currentStock;
        case 'stock_desc':
          return b.currentStock - a.currentStock;
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'created_desc':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [products, searchTerm, category, status, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('ALL');
    setStatus('ALL');
    setActiveFilter('true');
    setSortBy('created_desc');
  };

  // Add Product Submit
  const handleAddSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const newProduct = await productService.createProduct(formData);
      setProducts((prev) => [newProduct, ...prev]);
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Product Submit
  const handleEditSubmit = async (formData) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const updated = await productService.updateProduct(editingProduct.id, formData);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updated : p))
      );
      setEditingProduct(null);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(deletingProduct.id);
      if (activeFilter === 'true') {
        // If viewing active only, remove it from list
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      } else {
        // Mark as inactive in list
        setProducts((prev) =>
          prev.map((p) =>
            p.id === deletingProduct.id ? { ...p, isActive: false } : p
          )
        );
      }
      setDeletingProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <span>Products</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your store products and stock thresholds.
          </p>
        </div>

        {/* Action Button */}
        {isManager && (
          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onClearFilters={handleClearFilters}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
      />

      {/* Loading State */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
          <p className="text-sm font-medium text-[#64748B]">Loading products...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="min-h-[30vh] flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Unable to load products</h2>
            <p className="text-xs text-[#64748B]">
              Could not retrieve the product catalog from the database. Please try again.
            </p>
            <button
              onClick={fetchProductsData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-dashed border-[#D9E2EC] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          {products.length === 0 ? (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">No products found</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Your inventory catalog is currently empty. Get started by adding your first product.
              </p>
              {isManager && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setFormError(null);
                      setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">No products match your filters</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                No items match the current search query and filter criteria.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] border border-[#D9E2EC] text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Catalog Content */
        <div>
          {/* Desktop Table (hidden on small viewports) */}
          <div className="hidden lg:block">
            <ProductTable
              products={filteredProducts}
              isManager={isManager}
              onEdit={(prod) => {
                setFormError(null);
                setEditingProduct(prod);
              }}
              onDelete={(prod) => setDeletingProduct(prod)}
            />
          </div>

          {/* Mobile & Tablet Card List (hidden on lg viewports) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isManager={isManager}
                onEdit={(prod) => {
                  setFormError(null);
                  setEditingProduct(prod);
                }}
                onDelete={(prod) => setDeletingProduct(prod)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <ProductForm
          suppliers={suppliers}
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
          serverError={formError}
        />
      </ProductModal>

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
      >
        <ProductForm
          initialData={editingProduct}
          suppliers={suppliers}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingProduct(null)}
          isSubmitting={isSubmitting}
          serverError={formError}
        />
      </ProductModal>

      {/* Delete/Deactivate Confirmation Modal */}
      <ProductModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        title="Deactivate Product"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-[#0F172A]">
              <p className="font-semibold text-red-700 mb-1">
                Are you sure you want to deactivate "{deletingProduct?.name}"?
              </p>
              <p className="text-[#64748B]">
                This will soft delete the product by setting its status to inactive. It will be hidden from the default catalog view while preserving stock records.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setDeletingProduct(null)}
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

export default Products;
