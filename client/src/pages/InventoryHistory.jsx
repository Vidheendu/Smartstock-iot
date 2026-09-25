import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Search,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import inventoryService from '../services/inventory.service.js';
import productService from '../services/product.service.js';
import { TRANSACTION_TYPES, TRANSACTION_CONFIG, TRANSACTION_SOURCES } from '../utils/inventoryConstants.js';

export const InventoryHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') || 'ALL';

  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedProduct, setSelectedProduct] = useState(initialProductId);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sync selectedProduct if searchParams change
  useEffect(() => {
    const pId = searchParams.get('productId');
    if (pId) {
      setSelectedProduct(pId);
    }
  }, [searchParams]);

  // Load products list for dropdown filter
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await productService.getProducts({ isActive: 'all' });
        setProducts(prods);
      } catch (err) {
        console.warn('Failed to load products for history filter:', err);
      }
    };
    loadProducts();
  }, []);

  // Fetch history records
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedProduct !== 'ALL') {
        params.productId = selectedProduct;
      }
      if (selectedType !== 'ALL') {
        params.changeType = selectedType;
      }
      if (selectedSource !== 'ALL') {
        params.source = selectedSource;
      }
      const data = await inventoryService.getInventoryHistory(params);
      setHistory(data);
    } catch (err) {
      setError('Unable to load inventory history.');
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, selectedType, selectedSource]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Client-side text search (reason, SKU, product name, user)
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const q = searchTerm.trim().toLowerCase();

    return history.filter((item) => {
      const pName = (item.productName || '').toLowerCase();
      const sku = (item.sku || '').toLowerCase();
      const reason = (item.reason || '').toLowerCase();
      const user = (item.performedBy?.name || '').toLowerCase();
      return pName.includes(q) || sku.includes(q) || reason.includes(q) || user.includes(q);
    });
  }, [history, searchTerm]);

  const handleProductChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    if (val === 'ALL') {
      searchParams.delete('productId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ productId: val });
    }
  };

  const handleClearFilters = () => {
    setSelectedProduct('ALL');
    setSelectedType('ALL');
    setSelectedSource('ALL');
    setSearchTerm('');
    searchParams.delete('productId');
    setSearchParams(searchParams);
  };

  const isFiltered = Boolean(
    selectedProduct !== 'ALL' || selectedType !== 'ALL' || selectedSource !== 'ALL' || searchTerm.trim()
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1769C2] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inventory</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <span>Inventory History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Audit log of all manual and simulated inventory movements.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#D9E2EC] text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1769C2] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reason, product, SKU, or user..."
              className="w-full pl-10 pr-9 py-2 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#1769C2] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Product Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#1769C2] transition cursor-pointer"
            >
              <option value="ALL">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#1769C2] transition cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="STOCK_IN">Stock In</option>
              <option value="STOCK_OUT">Stock Out</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#1769C2] transition cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="MANUAL">Manual</option>
              <option value="IOT">IoT (Upcoming)</option>
            </select>
          </div>
        </div>

        {/* Filter Counts and Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D9E2EC] text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#1769C2]" />
            <span>
              Showing <strong className="text-[#0F172A] font-semibold">{filteredHistory.length}</strong> recorded audit transactions
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-blue-100 rounded-lg transition cursor-pointer border border-[#BFDBFE]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
          <p className="text-sm font-medium text-[#64748B]">Loading inventory history...</p>
        </div>
      ) : error ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Unable to load inventory history</h2>
            <p className="text-xs text-[#64748B]">
              Could not retrieve transaction audit logs. Please try again.
            </p>
            <button
              onClick={fetchHistory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white border border-dashed border-[#D9E2EC] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] flex items-center justify-center">
            <History className="w-7 h-7" />
          </div>
          {history.length === 0 ? (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">No inventory history yet</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Stock transactions performed via Stock In, Stock Out, or Adjustments will appear here with an immutable audit trail.
              </p>
              <div className="pt-2">
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <span>Go to Inventory</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">No history records match your filters</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Try selecting a different product, transaction type, or clearing search keywords.
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
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-[#D9E2EC] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4 text-center">Type</th>
                    <th className="py-3.5 px-4 text-right">Change</th>
                    <th className="py-3.5 px-4 text-center">Stock Flow</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4 text-center">Source</th>
                    <th className="py-3.5 px-4">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC] text-xs">
                  {filteredHistory.map((item) => {
                    const isPositive = Number(item.quantityChange) > 0;
                    const isNegative = Number(item.quantityChange) < 0;
                    const config =
                      TRANSACTION_CONFIG[item.changeType] || TRANSACTION_CONFIG.ADJUSTMENT;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                        {/* Date & Time */}
                        <td className="py-3.5 px-4 text-[#64748B] text-[11px] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          <span className="block text-[10px] text-[#64748B]">
                            {new Date(item.createdAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                          <Link
                            to={`/products/${item.productId}`}
                            className="hover:text-[#1769C2] transition"
                          >
                            {item.productName}
                          </Link>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                          {item.sku}
                        </td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.badgeClass}`}
                          >
                            {item.changeType === 'STOCK_IN' ? (
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            ) : item.changeType === 'STOCK_OUT' ? (
                              <ArrowUpRight className="w-3 h-3 text-[#1769C2]" />
                            ) : (
                              <Sliders className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{config.label}</span>
                          </span>
                        </td>

                        {/* Quantity Change */}
                        <td className="py-3.5 px-4 text-right font-bold">
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
                          </span>{' '}
                          <span className="text-[10px] font-normal text-[#64748B]">{item.unit}</span>
                        </td>

                        {/* Stock Flow (Prev -> New) */}
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-[#0F172A]">
                          <span className="text-[#64748B]">{item.previousStock}</span>
                          <span className="text-[#64748B] mx-1.5">→</span>
                          <span className="font-bold text-[#0F172A]">{item.newStock}</span>
                        </td>

                        {/* Reason */}
                        <td className="py-3.5 px-4 text-[#0F172A] max-w-xs truncate" title={item.reason}>
                          {item.reason}
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-[#0F172A] border border-[#D9E2EC]">
                            {item.source}
                          </span>
                        </td>

                        {/* Performed By */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#E8F2FF] border border-[#BFDBFE] flex items-center justify-center text-[10px] font-bold text-[#1769C2]">
                              {(item.performedBy?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-[#0F172A] truncate">
                                {item.performedBy?.name || 'Staff User'}
                              </p>
                              {item.performedBy?.email && (
                                <p className="text-[10px] text-[#64748B] truncate">
                                  {item.performedBy.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
            {filteredHistory.map((item) => {
              const isPositive = Number(item.quantityChange) > 0;
              const isNegative = Number(item.quantityChange) < 0;
              const config =
                TRANSACTION_CONFIG[item.changeType] || TRANSACTION_CONFIG.ADJUSTMENT;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-bold text-sm text-[#0F172A] hover:text-[#1769C2] transition line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="font-mono text-[11px] text-[#64748B]">{item.sku}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Stock Flow & Change */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Change
                      </span>
                      <span
                        className={`text-base font-bold ${
                          isPositive
                            ? 'text-emerald-700'
                            : isNegative
                            ? 'text-[#1769C2]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {isPositive ? `+${item.quantityChange}` : item.quantityChange}{' '}
                        <span className="text-xs font-normal text-[#64748B]">{item.unit}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Stock Flow
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#0F172A]">
                        {item.previousStock} → <strong className="text-[#0F172A]">{item.newStock}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Reason & User */}
                  <div className="text-xs space-y-1 text-[#64748B]">
                    <p className="text-[#0F172A]">
                      <strong className="font-medium text-[#64748B]">Reason:</strong> {item.reason}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#D9E2EC] text-[11px]">
                      <span>By: {item.performedBy?.name || 'Staff User'}</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryHistory;
