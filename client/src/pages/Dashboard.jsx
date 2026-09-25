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

        {/* User Identity & Refresh Action */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#0F172A]">{user?.name}</p>
            <p className="text-[11px] text-[#64748B]">{user?.email}</p>
          </div>
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

      {/* 1. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
