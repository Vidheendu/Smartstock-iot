import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Inbox,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  getAlerts,
  getAlertSummary,
  acknowledgeAlert,
  resolveAlert
} from '../services/alert.service.js';
import { getProducts } from '../services/product.service.js';
import AlertSummaryCards from '../components/alerts/AlertSummaryCards.jsx';
import AlertFilters from '../components/alerts/AlertFilters.jsx';
import AlertTable from '../components/alerts/AlertTable.jsx';
import AlertCard from '../components/alerts/AlertCard.jsx';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    activeAlerts: 0,
    criticalAlerts: 0,
    lowStockAlerts: 0,
    outOfStockAlerts: 0
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    severity: 'ALL',
    status: 'ALL',
    source: 'ALL',
    productId: 'ALL'
  });

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [alertsData, summaryData, productsData] = await Promise.all([
        getAlerts(),
        getAlertSummary(),
        getProducts()
      ]);

      setAlerts(alertsData || []);
      setSummary(summaryData || {});
      setProducts(productsData || []);
    } catch (err) {
      setError('Unable to load alerts.');
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      severity: 'ALL',
      status: 'ALL',
      source: 'ALL',
      productId: 'ALL'
    });
  };

  const handleSummarySelectSeverity = (severity) => {
    setFilters((prev) => ({
      ...prev,
      severity: prev.severity === severity ? 'ALL' : severity
    }));
  };

  // Acknowledge Action Handler
  const handleAcknowledge = async (alertId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [alertId]: 'ACKNOWLEDGE' }));
      const updated = await acknowledgeAlert(alertId);

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? updated : a))
      );

      // Refresh summary counts
      const updatedSummary = await getAlertSummary();
      setSummary(updatedSummary);

      setFeedbackMessage({
        type: 'success',
        text: `Alert for ${updated.productName} acknowledged.`
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to acknowledge alert.'
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[alertId];
        return next;
      });
    }
  };

  // Resolve Action Handler
  const handleResolve = async (alertId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [alertId]: 'RESOLVE' }));
      const updated = await resolveAlert(alertId);

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? updated : a))
      );

      // Refresh summary counts
      const updatedSummary = await getAlertSummary();
      setSummary(updatedSummary);

      setFeedbackMessage({
        type: 'success',
        text: `Alert for ${updated.productName} resolved.`
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to resolve alert.'
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[alertId];
        return next;
      });
    }
  };

  // Filtered alerts memoization
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // 1. Severity filter
      if (filters.severity !== 'ALL' && alert.severity !== filters.severity) {
        return false;
      }
      // 2. Status filter
      if (filters.status !== 'ALL' && alert.status !== filters.status) {
        return false;
      }
      // 3. Source filter
      if (filters.source !== 'ALL' && alert.source !== filters.source) {
        return false;
      }
      // 4. Product filter
      if (filters.productId !== 'ALL' && alert.productId !== filters.productId) {
        return false;
      }
      // 5. Search query
      if (filters.search && filters.search.trim() !== '') {
        const query = filters.search.toLowerCase().trim();
        const nameMatch = alert.productName?.toLowerCase().includes(query);
        const skuMatch = alert.sku?.toLowerCase().includes(query);
        const msgMatch = alert.message?.toLowerCase().includes(query);
        if (!nameMatch && !skuMatch && !msgMatch) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, filters]);

  // Loading View
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading alerts...</p>
        <p className="text-xs text-[#64748B]">Evaluating store threshold metrics</p>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-lg shadow-slate-200/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Unable to load alerts</h2>
          <p className="text-xs text-[#64748B]">
            An issue occurred while fetching inventory alerts. Please try again.
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

  const hasAnyAlerts = alerts.length > 0;
  const hasActiveAlerts = summary.activeAlerts > 0;

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[#64748B] hover:text-[#0F172A] transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Alerts
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                hasActiveAlerts
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {summary.activeAlerts} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Monitor stock conditions and inventory warnings.
          </p>
        </div>

        {/* Header Action: Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
            title="Refresh alerts"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? 'animate-spin text-[#1769C2]' : 'text-[#64748B]'
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <AlertSummaryCards
        summary={summary}
        selectedSeverity={filters.severity}
        onSelectSeverity={handleSummarySelectSeverity}
      />

      {/* 2. Filters */}
      <AlertFilters
        filters={filters}
        products={products}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Alerts List / Table */}
      {!hasAnyAlerts ? (
        // Empty State 1: No alerts in entire system
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">No alerts yet.</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            All inventory thresholds are healthy. Alerts will automatically generate when products reach low stock.
          </p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        // Empty State 2: Filters returned 0 records
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#64748B]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">No matching alerts found</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all records.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold text-[#1769C2] bg-[#E8F2FF] hover:bg-blue-100 rounded-xl transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Active condition status indicator if zero active */}
          {!hasActiveAlerts && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No active stock alerts. All previous warnings have been resolved.</span>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <AlertTable
              alerts={filteredAlerts}
              actionLoading={actionLoading}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                actionLoading={actionLoading}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            ))}
          </div>

          {/* Results count footer */}
          <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
            <span>
              Showing <strong className="text-[#0F172A]">{filteredAlerts.length}</strong> of{' '}
              <strong className="text-[#0F172A]">{alerts.length}</strong> total alerts
            </span>
            <span className="text-[11px]">
              Sorted newest first
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Alerts;
