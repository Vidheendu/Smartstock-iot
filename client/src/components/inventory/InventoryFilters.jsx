import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { PRODUCT_CATEGORIES, STOCK_STATUS_CONFIG } from '../../utils/productConstants.js';

export const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onClearFilters,
  totalCount,
  filteredCount
}) => {
  const isFiltered = Boolean(searchTerm.trim() || category !== 'ALL' || status !== 'ALL');

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-6 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by product name, SKU, category..."
            className="w-full pl-10 pr-9 py-2 bg-[#F4F8FC] border border-[#CBD5E1] rounded-xl text-xs sm:text-sm text-[#102A43] placeholder-[#64748B] focus:outline-none focus:border-[#1769C2] focus:ring-1 focus:ring-[#1769C2] transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#102A43] transition p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#F4F8FC] border border-[#CBD5E1] rounded-xl text-xs text-[#102A43] focus:outline-none focus:border-[#1769C2] transition cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#F4F8FC] border border-[#CBD5E1] rounded-xl text-xs text-[#102A43] focus:outline-none focus:border-[#1769C2] transition cursor-pointer"
          >
            <option value="ALL">All Stock Statuses</option>
            {Object.keys(STOCK_STATUS_CONFIG).map((key) => (
              <option key={key} value={key}>
                {STOCK_STATUS_CONFIG[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta Bar: Counts & Clear Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1769C2]" />
          <span>
            Showing <strong className="text-[#102A43] font-semibold">{filteredCount}</strong> of{' '}
            <strong className="text-[#102A43] font-semibold">{totalCount}</strong> inventory items
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-200"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default InventoryFilters;
