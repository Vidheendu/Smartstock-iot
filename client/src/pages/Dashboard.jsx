import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  BellRing,
  Bell,
  ArrowRight,
  BarChart3,
  TrendingDown,
  Clock
} from 'lucide-react';
import {
  getDashboardStats,
  getStockStatusSummary,
  getRecentActivities
} from '../services/dashboard.service.js';
import { getForecastOverview } from '../services/forecast.service.js';
import { formatDaysRemaining } from '../utils/forecastConstants.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import StockStatusCard from '../components/dashboard/StockStatusCard.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';

export const Dashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const [stats, setStats] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [forecastProducts, setForecastProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, statusRes, activitiesRes, forecastRes] = await Promise.all([
        getDashboardStats(),
        getStockStatusSummary(),
        getRecentActivities(),
        getForecastOverview(30).catch(() => null)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (statusRes.success) setStockStatus(statusRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
      if (forecastRes?.success && Array.isArray(forecastRes?.data?.products)) {
        // Filter products with valid forecast and positive stock, sorted by shortest days
        const validForecasts = forecastRes.data.products
          .filter((p) => p.forecastAvailable && p.estimatedDaysRemaining !== null)
          .slice(0, 3);
        setForecastProducts(validForecasts);
      }
    } catch (err) {
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading dashboard...</p>
        <p className="text-xs text-[#64748B]">Preparing stock overview metrics</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-lg shadow-slate-200/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Unable to load dashboard data</h2>
          <p className="text-xs text-[#64748B]">
            An issue occurred while fetching the inventory overview. Please retry.
          </p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const isManager = user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Dashboard
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isManager
                  ? 'bg-[#D1FAE5] text-emerald-800 border border-emerald-300'
                  : 'bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]'
              }`}
            >
              {user?.role || 'STAFF'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Overview of your store inventory and stock activity.
          </p>
        </div>

        {/* User Identity & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block mr-1">
            <p className="text-xs font-bold text-[#0F172A]">{user?.name}</p>
            <p className="text-[11px] text-[#64748B]">{user?.email}</p>
          </div>
          <Link
            to="/analytics"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1769C2] bg-[#E8F2FF] hover:bg-[#D9EAFE] border border-[#BFDBFE] rounded-xl transition cursor-pointer shadow-xs"
            title="View store analytics & insights"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Analytics</span>
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1769C2]' : 'text-[#64748B]'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification Indicator Banner (Phase 8) */}
      {unreadCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#BFDBFE] flex items-center justify-center text-[#1769C2] shrink-0 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#0F172A]">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-[#64748B]">
                New inventory alerts have been issued and require attention.
              </p>
            </div>
          </div>
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto shrink-0"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 1. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          variant="blue"
          badge="Live Catalog"
          subtitle="Total registered stock SKUs"
        />

        <StatCard
          title="Low Stock"
          value={stats?.lowStock ?? 0}
          icon={AlertTriangle}
          variant="amber"
          badge="Warning"
          subtitle="Stock at or below minimum level"
        />

        <StatCard
          title="Critical Stock"
          value={stats?.criticalStock ?? 0}
          icon={AlertOctagon}
          variant="orange"
          badge="Urgent"
          subtitle="Stock <= 50% minimum level"
        />

        <StatCard
          title="Out of Stock"
          value={stats?.outOfStock ?? 0}
          icon={XCircle}
          variant="red"
          badge="Depleted"
          subtitle="Stock level currently at zero"
        />

        <StatCard
          title="Active Alerts"
          value={stats?.activeAlerts ?? 0}
          icon={BellRing}
          variant="red"
          badge="Action Req."
          subtitle="Unresolved stock deficit warnings"
        />
      </div>

      {/* 2. Stock Status Overview */}
      <StockStatusCard summary={stockStatus} />

      {/* 2.5 Stock Forecast Preview (Phase 10) */}
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2]">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Stock Forecast</h2>
              <p className="text-xs text-[#64748B]">
                Products with shortest estimated remaining stock based on 30-day historical consumption.
              </p>
            </div>
          </div>
          <Link
            to="/forecast"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8F2FF] hover:bg-[#D9EAFE] text-[#1769C2] text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {forecastProducts.length === 0 ? (
          <p className="text-xs text-[#64748B] italic py-2">
            No consumption forecast data available yet. Use store checkout or stock-out transactions to establish consumption trends.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {forecastProducts.map((p) => (
              <div
                key={p.productId}
                className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#0F172A] truncate max-w-[150px]">
                    {p.productName}
                  </p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    Stock: {p.currentStock} {p.unit}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                      p.estimatedDaysRemaining < 7
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : p.estimatedDaysRemaining < 14
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {formatDaysRemaining(p.estimatedDaysRemaining)}
                  </span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    {p.averageDailyConsumption} {p.unit}/day
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Recent Activity */}
      <RecentActivity activities={activities} />

      {/* 4. Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
