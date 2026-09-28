import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import ForecastStatusBadge from './ForecastStatusBadge.jsx';
import {
  formatDaysRemaining,
  formatADC,
  formatDepletionDate
} from '../../utils/forecastConstants.js';

export const ForecastTable = ({ products = [], onSelectProduct, periodDays = 30 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || p.forecastStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const hasData = products && products.length > 0;

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl shadow-xs overflow-hidden">
      {/* Table Controls Header */}
      <div className="p-4 border-b border-[#D9E2EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Product Demand Forecasts</h3>
          <p className="text-[11px] text-[#64748B]">
            Estimated depletion timelines calculated over {periodDays}-day window
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9E2EC] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:border-[#1769C2]"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#D9E2EC] rounded-xl text-xs text-[#0F172A] font-semibold focus:outline-hidden focus:border-[#1769C2] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="URGENT">Urgent (&lt; 7d)</option>
              <option value="ATTENTION">Attention (7-13d)</option>
              <option value="STABLE">Stable (&ge; 14d)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="NO_DATA">No Consumption Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {!hasData ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <p className="text-xs font-semibold">No catalog products found to forecast.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-10 text-center text-slate-400 space-y-2">
          <p className="text-xs font-semibold">No products match your search or filter.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="text-xs font-bold text-[#1769C2] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#64748B] font-bold uppercase text-[10px] tracking-wider bg-slate-50/70">
                <th className="py-3 px-3.5">Product</th>
                <th className="py-3 px-3 text-right">Current Stock</th>
                <th className="py-3 px-3 text-right">Min Stock</th>
                <th className="py-3 px-3 text-right">Total Consumed</th>
                <th className="py-3 px-3 text-right">Avg. Daily (ADC)</th>
                <th className="py-3 px-3 text-right">Days Remaining</th>
                <th className="py-3 px-3 text-center">Projected Depletion</th>
                <th className="py-3 px-3 text-center">Forecast Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                return (
                  <tr
                    key={p.productId}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectProduct(p)}
                  >
                    {/* Product */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-[#0F172A] group-hover:text-[#1769C2] transition-colors">
                        {p.productName}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono">
                        {p.sku} • {p.category}
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3 text-right font-black text-[#0F172A]">
                      {p.currentStock}{' '}
                      <span className="font-normal text-[10px] text-[#64748B]">{p.unit}</span>
                    </td>

                    {/* Minimum Stock */}
                    <td className="py-3 px-3 text-right font-semibold text-[#64748B]">
                      {p.minimumStock}{' '}
                      <span className="font-normal text-[10px] text-[#64748B]">{p.unit}</span>
                    </td>

                    {/* Total Consumed */}
                    <td className="py-3 px-3 text-right font-semibold text-[#0F172A]">
                      {p.totalConsumed > 0 ? (
                        <span>
                          {p.totalConsumed}{' '}
                          <span className="font-normal text-[10px] text-[#64748B]">{p.unit}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">0</span>
                      )}
                    </td>

                    {/* Average Daily Consumption */}
                    <td className="py-3 px-3 text-right font-bold text-blue-700">
                      {p.averageDailyConsumption > 0 ? (
                        formatADC(p.averageDailyConsumption, p.unit)
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-normal">None</span>
                      )}
                    </td>

                    {/* Days Remaining */}
                    <td className="py-3 px-3 text-right font-black">
                      {p.estimatedDaysRemaining !== null ? (
                        <span
                          className={
                            p.estimatedDaysRemaining < 7
                              ? 'text-red-600'
                              : p.estimatedDaysRemaining < 14
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {formatDaysRemaining(p.estimatedDaysRemaining)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal italic text-[11px]">
                          No data
                        </span>
                      )}
                    </td>

                    {/* Projected Depletion Date */}
                    <td className="py-3 px-3 text-center text-[#64748B] font-medium">
                      {formatDepletionDate(p.projectedDepletionDate)}
                    </td>

                    {/* Forecast Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <ForecastStatusBadge status={p.forecastStatus} />
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#1769C2] hover:bg-[#E8F2FF] rounded-lg transition cursor-pointer"
                        title="View consumption details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ForecastTable;
