import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import {
  ALERT_SEVERITIES,
  ALERT_STATUSES,
  ALERT_SOURCES
} from '../../utils/alertConstants.js';

export const AlertFilters = ({
  filters,
  products = [],
  onFilterChange,
  onResetFilters
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.severity !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.source !== 'ALL' ||
    filters.productId !== 'ALL';

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product, SKU, or alert message..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder-[#64748B] bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.severity || 'ALL'}
            onChange={(e) => onFilterChange('severity', e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value={ALERT_SEVERITIES.LOW}>Low Stock</option>
            <option value={ALERT_SEVERITIES.CRITICAL}>Critical Stock</option>
            <option value={ALERT_SEVERITIES.OUT_OF_STOCK}>Out of Stock</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value={ALERT_STATUSES.ACTIVE}>Active</option>
            <option value={ALERT_STATUSES.ACKNOWLEDGED}>Acknowledged</option>
            <option value={ALERT_STATUSES.RESOLVED}>Resolved</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.source || 'ALL'}
            onChange={(e) => onFilterChange('source', e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value={ALERT_SOURCES.MANUAL}>Manual</option>
            <option value={ALERT_SOURCES.IOT}>IoT Sensor</option>
            <option value={ALERT_SOURCES.SYSTEM}>System</option>
          </select>
        </div>

        {/* Product Filter */}
        <div className="min-w-[170px]">
          <select
            value={filters.productId || 'ALL'}
            onChange={(e) => onFilterChange('productId', e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition cursor-pointer truncate"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer shrink-0"
            title="Clear all active filters"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertFilters;
