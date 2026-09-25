import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../utils/productConstants.js';

export const ProductFilters = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  activeFilter,
  onActiveFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  totalCount,
  filteredCount
}) => {
  const isFiltered =
    Boolean(searchTerm) ||
    category !== 'ALL' ||
    status !== 'ALL' ||
    activeFilter !== 'true' ||
    sortBy !== 'created_desc';

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name, SKU, or category..."
            className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="min-w-[130px] flex-1 sm:flex-none">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2.5 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] cursor-pointer"
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
          <div className="min-w-[130px] flex-1 sm:flex-none">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2.5 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] cursor-pointer"
            >
              <option value="ALL">All Stock States</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low Stock</option>
              <option value="CRITICAL">Critical Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* Active Status Dropdown */}
          <div className="min-w-[110px] flex-1 sm:flex-none">
            <select
              value={activeFilter}
              onChange={(e) => onActiveFilterChange(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2.5 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] cursor-pointer"
            >
              <option value="true">Active Only</option>
              <option value="all">All Records</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="min-w-[140px] flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl px-3 py-2.5 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] cursor-pointer"
            >
              <option value="created_desc">Newest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Stats & Clear action */}
      <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#D9E2EC]">
        <div>
          Showing <span className="font-bold text-[#0F172A]">{filteredCount}</span> of{' '}
          <span className="font-bold text-[#0F172A]">{totalCount}</span> products
          {isFiltered && (
            <span className="text-[#1769C2] font-semibold ml-1.5">(filtered)</span>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[#1769C2] hover:text-[#1257A0] font-bold transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
