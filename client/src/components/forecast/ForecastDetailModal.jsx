import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  Calendar,
  Layers,
  Clock,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';
import { getProductConsumption } from '../../services/forecast.service.js';
import ForecastStatusBadge from './ForecastStatusBadge.jsx';
import ConsumptionChart from './ConsumptionChart.jsx';
import {
  formatDaysRemaining,
  formatADC,
  formatDepletionDate
} from '../../utils/forecastConstants.js';

export const ForecastDetailModal = ({ isOpen, onClose, product, periodDays = 30 }) => {
  const [consumption, setConsumption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && product) {
      setLoading(true);
      setError(null);
      getProductConsumption(product.productId, periodDays)
        .then((res) => {
          if (res.success) {
            setConsumption(res.data);
          }
        })
        .catch((err) => {
          console.error('[CONSUMPTION FETCH ERROR]', err);
          setError('Unable to load consumption timeline.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setConsumption(null);
    }
  }, [isOpen, product, periodDays]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#D9E2EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E2EC] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2]">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  {product.productName}
                </h2>
                <ForecastStatusBadge status={product.forecastStatus} />
              </div>
              <p className="text-xs text-[#64748B] font-mono mt-0.5">
                SKU: {product.sku} • Category: {product.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Current Stock</span>
              <p className="text-lg font-black text-[#0F172A] mt-0.5">
                {product.currentStock}{' '}
                <span className="text-xs font-normal text-[#64748B]">{product.unit}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Consumed</span>
              <p className="text-lg font-black text-[#0F172A] mt-0.5">
                {product.totalConsumed}{' '}
                <span className="text-xs font-normal text-[#64748B]">{product.unit}</span>
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-bold text-[#1769C2] uppercase">Daily Rate (ADC)</span>
              <p className="text-lg font-black text-blue-900 mt-0.5">
                {formatADC(product.averageDailyConsumption, product.unit)}
              </p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Days Remaining</span>
              <p className="text-lg font-black text-indigo-900 mt-0.5">
                {formatDaysRemaining(product.estimatedDaysRemaining)}
              </p>
            </div>
          </div>

          {/* Depletion Projection Row */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#1769C2]" />
              <div>
                <span className="font-bold text-[#0F172A]">Projected Depletion Date: </span>
                <span className="font-extrabold text-[#1769C2]">
                  {formatDepletionDate(product.projectedDepletionDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#64748B]">Confidence:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  product.dataConfidence === 'HIGH'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : product.dataConfidence === 'LIMITED'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}
              >
                {product.dataConfidence} ({product.consumptionRecordsCount} records)
              </span>
            </div>
          </div>

          {/* Consumption Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-[#1769C2]" />
                <span>Historical Daily Consumption ({periodDays}-day window)</span>
              </h4>
              <span className="text-[10px] text-[#64748B]">
                Actual STOCK_OUT events
              </span>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center space-x-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-[#1769C2]" />
                <span className="text-xs">Loading consumption history...</span>
              </div>
            ) : error ? (
              <div className="h-48 flex items-center justify-center text-xs text-red-500">
                {error}
              </div>
            ) : (
              <ConsumptionChart
                timeline={consumption?.timeline}
                unit={product.unit}
                height={200}
              />
            )}
          </div>

          {/* Methodology Formula Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-[#64748B] space-y-1">
            <span className="font-bold text-[#0F172A] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#1769C2]" />
              Calculation Methodology:
            </span>
            <p>
              Forecast is calculated using historical <span className="font-semibold text-slate-700">STOCK_OUT</span> transactions.
              Average Daily Consumption is calculated as total consumed quantity ({product.totalConsumed} {product.unit}) divided by the number of calendar days in the observation period ({periodDays} days).
              Estimated Days Remaining is calculated as current stock ({product.currentStock}) divided by average daily consumption ({product.averageDailyConsumption}).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9E2EC] bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForecastDetailModal;
