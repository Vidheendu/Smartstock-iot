import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Boxes,
  History,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  PackageCheck,
  CheckCircle2
} from 'lucide-react';
import inventoryService from '../services/inventory.service.js';
import InventoryTable from '../components/inventory/InventoryTable.jsx';
import InventoryCard from '../components/inventory/InventoryCard.jsx';
import InventoryFilters from '../components/inventory/InventoryFilters.jsx';
import TransactionModal from '../components/inventory/TransactionModal.jsx';

export const Inventory = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // Data state
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Transaction Modal state
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [modalType, setModalType] = useState('STOCK_IN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      const data = await inventoryService.getInventory();
      setInventory(data);
    } catch (err) {
      setError('Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Client-side search and filtering
  const filteredInventory = useMemo(() => {
    let result = [...inventory];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'ALL') {
      result = result.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (status !== 'ALL') {
      result = result.filter((item) => item.status === status);
    }

    return result;
  }, [inventory, searchTerm, category, status]);

  // Metric summaries
  const metrics = useMemo(() => {
    let normal = 0;
    let low = 0;
    let critical = 0;
    let outOfStock = 0;

    inventory.forEach((item) => {
      switch (item.status) {
        case 'NORMAL':
          normal++;
          break;
        case 'LOW':
          low++;
          break;
        case 'CRITICAL':
          critical++;
          break;
        case 'OUT_OF_STOCK':
          outOfStock++;
          break;
      }
    });

    return {
      total: inventory.length,
      normal,
      low,
      critical,
      outOfStock
    };
  }, [inventory]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('ALL');
    setStatus('ALL');
  };

  const handleOpenTransaction = (item, type) => {
    setModalError(null);
    setModalType(type);
    setActiveModalProduct(item);
  };

  const handleTransactionSubmit = async ({ type, productId, quantity, newStock, reason }) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      let res;
      if (type === 'STOCK_IN') {
        res = await inventoryService.stockIn(productId, quantity, reason);
      } else if (type === 'STOCK_OUT') {
        res = await inventoryService.stockOut(productId, quantity, reason);
      } else if (type === 'ADJUSTMENT') {
        res = await inventoryService.adjustStock(productId, newStock, reason);
      }

      // Update state in inventory list
      if (res?.inventory) {
        setInventory((prev) =>
          prev.map((item) => (item.productId === productId ? res.inventory : item))
        );
      }

      setActiveModalProduct(null);

      // Trigger success notification toast
      const actionName =
        type === 'STOCK_IN'
          ? `Added +${quantity} units to`
          : type === 'STOCK_OUT'
          ? `Deducted -${quantity} units from`
          : `Adjusted stock for`;
      setSuccessToast(`${actionName} ${activeModalProduct?.name} successfully.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Unable to update inventory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <span>Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Monitor current stock levels and inventory movements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/inventory/history"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#D9E2EC] text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <History className="w-4 h-4 text-[#1769C2]" />
            <span>View History</span>
          </Link>

          {isManager && (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog</span>
            </Link>
          )}
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3.5 bg-[#D1FAE5] border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-800 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
            Total Tracked
          </span>
          <p className="text-2xl font-bold text-[#0F172A]">{metrics.total}</p>
        </div>

        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Normal Stock
          </span>
          <p className="text-2xl font-bold text-emerald-700">{metrics.normal}</p>
        </div>

        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Low Stock
          </span>
          <p className="text-2xl font-bold text-amber-700">{metrics.low}</p>
        </div>

        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">
            Critical / Empty
          </span>
          <p className="text-2xl font-bold text-red-700">
            {metrics.critical + metrics.outOfStock}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        onClearFilters={handleClearFilters}
        totalCount={inventory.length}
        filteredCount={filteredInventory.length}
      />

      {/* Content Section */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
          <p className="text-sm font-medium text-[#64748B]">Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Unable to load inventory</h2>
            <p className="text-xs text-[#64748B]">
              Could not retrieve current inventory levels from the server. Please try again.
            </p>
            <button
              onClick={fetchInventory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bg-white border border-dashed border-[#D9E2EC] rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] flex items-center justify-center">
            <Boxes className="w-7 h-7" />
          </div>
          {inventory.length === 0 ? (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">No inventory records found</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Your inventory catalog is currently empty. Add products from the Catalog page to start tracking stock.
              </p>
              {isManager && (
                <div className="pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Go to Products</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">No inventory records match your filters</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                No items match your active search and filter options.
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
        <div>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <InventoryTable
              items={filteredInventory}
              isManager={isManager}
              onStockIn={(item) => handleOpenTransaction(item, 'STOCK_IN')}
              onStockOut={(item) => handleOpenTransaction(item, 'STOCK_OUT')}
              onAdjust={(item) => handleOpenTransaction(item, 'ADJUSTMENT')}
            />
          </div>

          {/* Mobile & Tablet Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
            {filteredInventory.map((item) => (
              <InventoryCard
                key={item.productId}
                item={item}
                isManager={isManager}
                onStockIn={(it) => handleOpenTransaction(it, 'STOCK_IN')}
                onStockOut={(it) => handleOpenTransaction(it, 'STOCK_OUT')}
                onAdjust={(it) => handleOpenTransaction(it, 'ADJUSTMENT')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={Boolean(activeModalProduct)}
        onClose={() => setActiveModalProduct(null)}
        product={activeModalProduct}
        initialType={modalType}
        onSubmit={handleTransactionSubmit}
        isSubmitting={isSubmitting}
        serverError={modalError}
        isManager={isManager}
      />
    </div>
  );
};

export default Inventory;
