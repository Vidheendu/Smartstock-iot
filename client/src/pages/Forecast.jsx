import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getForecastOverview } from '../services/forecast.service.js';
import ForecastSummaryCards from '../components/forecast/ForecastSummaryCards.jsx';
import ForecastMethodology from '../components/forecast/ForecastMethodology.jsx';
import ForecastTable from '../components/forecast/ForecastTable.jsx';
import ForecastDetailModal from '../components/forecast/ForecastDetailModal.jsx';
import { FORECAST_PERIODS } from '../utils/forecastConstants.js';

export const Forecast = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected product for detailed modal inspection
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchForecast = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getForecastOverview(selectedPeriod);
      if (res.success) {
        setForecastData(res.data);
      } else {
        setError('Unable to load forecast data.');
      }
    } catch (err) {
      console.error('[FORECAST LOAD ERROR]', err);
      setError('Unable to load forecast data.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const handlePeriodChange = (period) => {
    if (period !== selectedPeriod) {
      setSelectedPeriod(period);
    }
  };

  const handleRefresh = () => {
    fetchForecast(true);
  };

  const handleOpenProductDetail = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseProductDetail = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Full page initial loading state
  if (loading && !forecastData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading demand forecasts...</p>
        <p className="text-xs text-[#64748B]">Calculating average daily consumption rates from stock-out history</p>
      </div>
    );
  }

  // Full page error state
  if (error && !forecastData) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-lg shadow-slate-200/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Unable to load forecast data</h2>
          <p className="text-xs text-[#64748B]">
            An issue occurred while evaluating inventory consumption records. Please verify server connectivity and retry.
          </p>
          <button
            onClick={() => fetchForecast(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Stock Forecast
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
              Rule-Based Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Estimate inventory consumption and projected stock depletion using historical stock-out data.
          </p>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Segmented Period Buttons */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {FORECAST_PERIODS.map((p) => {
              const isActive = p.id === selectedPeriod;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1769C2] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="hidden sm:inline">{p.label}</span>
                  <span className="sm:hidden">{p.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
            title="Recalculate forecast"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1769C2]' : 'text-[#64748B]'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Forecast Summary Cards */}
      <ForecastSummaryCards
        summary={forecastData?.summary}
        periodDays={selectedPeriod}
        loading={loading}
      />

      {/* 3. Methodology Information Box */}
      <ForecastMethodology />

      {/* 4. Product Forecast Table */}
      <ForecastTable
        products={forecastData?.products || []}
        onSelectProduct={handleOpenProductDetail}
        periodDays={selectedPeriod}
      />

      {/* 5. Detailed Product Forecast Modal */}
      <ForecastDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseProductDetail}
        product={selectedProduct}
        periodDays={selectedPeriod}
      />
    </div>
  );
};

export default Forecast;
