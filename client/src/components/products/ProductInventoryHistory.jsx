import React, { useState, useEffect, useCallback } from 'react';
import { History, Filter, ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import inventoryService from '../../services/inventory.service.js';
import { TRANSACTION_CONFIG } from '../../utils/inventoryConstants.js';

/**
 * ProductInventoryHistory component.
 * Displays inventory history table for a specific product with filtering by
 * Transaction Type, Source, and Date Range, plus server-side pagination.
 */
export const ProductInventoryHistory = ({ productId, unit = 'units', refreshKey = 0 }) => {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [changeType, setChangeType] = useState('ALL');
  const [source, setSource] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const fetchHistory = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const params = {
        changeType: changeType !== 'ALL' ? changeType : undefined,
        source: source !== 'ALL' ? source : undefined,
        dateFilter: dateFilter !== 'ALL' ? dateFilter : undefined,
        page,
        limit
      };

      const res = await inventoryService.getProductHistory(productId, params);
      setHistory(Array.isArray(res) ? res : (res?.data || []));
      setTotal(res?.total ?? (Array.isArray(res) ? res.length : 0));
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      console.error('[PRODUCT HISTORY] Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, changeType, source, dateFilter, page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  // Reset page to 1 whenever filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#D9E2EC]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <History className="w-4 h-4 text-[#1769C2]" />
            <span>Inventory History</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit trail of all recorded stock transactions (newest first)
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transaction Type Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3 h-3 text-[#64748B]" />
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Type:</span>
            <select
              value={changeType}
              onChange={(e) => handleFilterChange(setChangeType, e.target.value)}
              className="bg-transparent font-medium text-[#0F172A] outline-hidden cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="STOCK_IN">Stock In</option>
              <option value="STOCK_OUT">Stock Out</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Source:</span>
            <select
              value={source}
              onChange={(e) => handleFilterChange(setSource, e.target.value)}
              className="bg-transparent font-medium text-[#0F172A] outline-hidden cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="MANUAL">Manual</option>
              <option value="IOT">IoT</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => handleFilterChange(setDateFilter, e.target.value)}
              className="bg-transparent font-medium text-[#0F172A] outline-hidden cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="today">Today</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#1769C2]" />
          <p className="text-xs text-[#64748B]">Loading inventory history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-1">
          <p className="text-xs font-semibold text-[#0F172A]">No inventory transactions found.</p>
          <p className="text-[11px] text-[#64748B]">
            {changeType !== 'ALL' || source !== 'ALL' || dateFilter !== 'ALL'
              ? 'Try adjusting or clearing the active filters above.'
              : 'No stock movements have been recorded yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D9E2EC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Transaction</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-center">Previous Stock</th>
                  <th className="py-2.5 px-3 text-center">New Stock</th>
                  <th className="py-2.5 px-3 text-center">Source</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2EC]">
                {history.map((item) => {
                  const qtyChange = Number(item.quantityChange);
                  const isPositive = qtyChange > 0;
                  const isNegative = qtyChange < 0;
                  const config = TRANSACTION_CONFIG[item.changeType] || TRANSACTION_CONFIG.ADJUSTMENT;

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}{' '}
                        <span className="text-[10px]">
                          {new Date(item.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
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
                          {isPositive ? `+${qtyChange}` : qtyChange} {unit}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#64748B]">
                        {item.previousStock}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono text-[11px] font-bold text-[#0F172A]">
                        {item.newStock}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#0F172A] border border-slate-200">
                          {item.source || 'MANUAL'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-[#0F172A] max-w-xs truncate" title={item.reason}>
                        {item.reason || '—'}
                      </td>

                      <td className="py-2.5 px-3 text-[#64748B] text-[11px]">
                        {item.performedBy?.name || 'System / Staff'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#D9E2EC] text-xs text-[#64748B]">
            <span>
              Showing <strong className="text-[#0F172A]">{startIdx}–{endIdx}</strong> of{' '}
              <strong className="text-[#0F172A]">{total}</strong> transactions
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E2EC] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 font-bold text-[#0F172A] text-xs">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E2EC] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductInventoryHistory;
