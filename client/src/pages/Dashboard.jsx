import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  getDashboardStats,
  getStockStatusSummary,
  getRecentActivities
} from '../services/dashboard.service.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import StockStatusCard from '../components/dashboard/StockStatusCard.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';

export const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, statusRes, activitiesRes] = await Promise.all([
        getDashboardStats(),
        getStockStatusSummary(),
        getRecentActivities()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (statusRes.success) setStockStatus(statusRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-300">Loading dashboard...</p>
        <p className="text-xs text-slate-500">Preparing stock overview metrics</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/90 border border-red-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Unable to load dashboard data</h2>
          <p className="text-xs text-slate-400">
            An issue occurred while fetching the inventory overview. Please retry.
          </p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isManager
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {user?.role || 'STAFF'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overview of your store inventory and stock activity.
          </p>
        </div>

        {/* User Identity & Refresh Action */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user?.name}</p>
            <p className="text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          variant="indigo"
          badge="Catalog"
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
          badge="Empty"
          subtitle="Stock level currently at zero"
        />
      </div>

      {/* 2. Stock Status Overview */}
      <StockStatusCard summary={stockStatus} />

      {/* 3. Recent Activity */}
      <RecentActivity activities={activities} />

      {/* 4. Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
