import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  getOverview,
  getInventoryMovement,
  getCategoryAnalytics,
  getProductAnalytics,
  getAlertAnalytics,
  getIoTAnalytics
} from '../services/analytics.service.js';
import AnalyticsSummaryCards from '../components/analytics/AnalyticsSummaryCards.jsx';
import StockStatusChart from '../components/analytics/StockStatusChart.jsx';
import InventoryMovementChart from '../components/analytics/InventoryMovementChart.jsx';
import CategoryStockChart from '../components/analytics/CategoryStockChart.jsx';
import ProductStockChart from '../components/analytics/ProductStockChart.jsx';
import ProductAttentionTable from '../components/analytics/ProductAttentionTable.jsx';
import AlertTrendChart from '../components/analytics/AlertTrendChart.jsx';
import IoTTelemetryChart from '../components/analytics/IoTTelemetryChart.jsx';

const TIME_RANGES = [
  { id: 'today', label: 'Today', shortLabel: '24h' },
  { id: '7d', label: 'Last 7 Days', shortLabel: '7d' },
  { id: '30d', label: 'Last 30 Days', shortLabel: '30d' },
  { id: '90d', label: 'Last 90 Days', shortLabel: '90d' }
];

export const Analytics = () => {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [overview, setOverview] = useState(null);
  const [movement, setMovement] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [iotData, setIotData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const currentRangeObj = TIME_RANGES.find((r) => r.id === selectedRange) || TIME_RANGES[2];

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch across analytics endpoints
      const [
        overviewRes,
        movementRes,
        categoriesRes,
        productsRes,
        alertsRes,
        iotRes
      ] = await Promise.all([
        getOverview(selectedRange),
        getInventoryMovement(selectedRange),
        getCategoryAnalytics(),
        getProductAnalytics(),
        getAlertAnalytics(selectedRange),
        getIoTAnalytics(selectedRange)
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (movementRes.success) setMovement(movementRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (productsRes.success) setProductData(productsRes.data);
      if (alertsRes.success) setAlertData(alertsRes.data);
      if (iotRes.success) setIotData(iotRes.data);
    } catch (err) {
      console.error('[ANALYTICS LOAD ERROR]', err);
      setError('Unable to load analytics.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleRangeChange = (rangeId) => {
    if (rangeId !== selectedRange) {
      setSelectedRange(rangeId);
    }
  };

  // Full page loading state
  if (loading && !overview) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading analytics...</p>
        <p className="text-xs text-[#64748B]">Aggregating store telemetry, stock movements, and alerts</p>
      </div>
    );
  }

  // Full page error state
  if (error && !overview) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-lg shadow-slate-200/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Unable to load analytics</h2>
          <p className="text-xs text-[#64748B]">
            An issue occurred while fetching inventory analytics. Please check server connectivity and retry.
          </p>
          <button
            onClick={() => fetchAnalytics(false)}
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
      {/* 1. Header & Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
              Real Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Understand inventory activity, stock levels, and store trends.
          </p>
        </div>

        {/* Time Range Selector & Refresh Action */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Segmented Range Buttons */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {TIME_RANGES.map((r) => {
              const isActive = r.id === selectedRange;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRangeChange(r.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1769C2] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="hidden sm:inline">{r.label}</span>
                  <span className="sm:hidden">{r.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1769C2]' : 'text-[#64748B]'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics (8 Real Database KPIs) */}
      <AnalyticsSummaryCards overview={overview} loading={loading} />

      {/* 3. Row 1: Stock Status Distribution & Inventory Movement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockStatusChart
          distribution={productData?.statusDistribution}
          totalProducts={overview?.totalProducts}
        />
        <InventoryMovementChart
          movementData={movement}
          rangeLabel={currentRangeObj.label}
        />
      </div>

      {/* 4. Row 2: Current Stock by Category & Product Stock Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryStockChart categories={categories} />
        <ProductStockChart products={productData?.products} />
      </div>

      {/* 5. Row 3: Products Requiring Attention */}
      <ProductAttentionTable attentionProducts={productData?.attentionProducts} />

      {/* 6. Row 4: Alert Trends & Source Breakdown */}
      <AlertTrendChart alertData={alertData} rangeLabel={currentRangeObj.label} />

      {/* 7. Row 5: Simulated IoT Analytics */}
      <IoTTelemetryChart iotData={iotData} rangeLabel={currentRangeObj.label} />
    </div>
  );
};

export default Analytics;
