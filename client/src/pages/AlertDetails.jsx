import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  CheckCheck,
  Package,
  Calendar,
  User,
  Sliders,
  Radio,
  Clock,
  ExternalLink,
  History,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  getAlert,
  acknowledgeAlert,
  resolveAlert
} from '../services/alert.service.js';
import {
  AlertSeverityBadge,
  AlertStatusBadge,
  AlertSourceBadge
} from '../components/alerts/AlertBadges.jsx';
import {
  formatFullDateTime,
  formatTimeAgo,
  SEVERITY_CONFIG
} from '../utils/alertConstants.js';

export const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchAlert = useCallback(async () => {
    try {
      setError(null);
      const data = await getAlert(id);
      setAlert(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Alert not found.');
      } else {
        setError('Unable to load alert details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlert();
  }, [fetchAlert]);

  const handleAcknowledge = async () => {
    try {
      setActionLoading('ACKNOWLEDGE');
      const updated = await acknowledgeAlert(id);
      setAlert(updated);
      setActionSuccess('Alert has been acknowledged successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to acknowledge alert.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async () => {
    try {
      setActionLoading('RESOLVE');
      const updated = await resolveAlert(id);
      setAlert(updated);
      setActionSuccess('Alert has been resolved successfully. Inventory remains unchanged.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resolve alert.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2]" />
        <p className="text-sm font-semibold text-[#0F172A]">Loading alert details...</p>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-lg shadow-slate-200/50">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">{error || 'Alert not found.'}</h2>
          <p className="text-xs text-[#64748B]">
            The requested alert record could not be found or has an invalid identifier.
          </p>
          <button
            onClick={() => navigate('/alerts')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Alerts</span>
          </button>
        </div>
      </div>
    );
  }

  const sevConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
  const isActionInProgress = Boolean(actionLoading);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Alerts</span>
        </Link>

        <div className="flex items-center gap-2">
          <AlertSourceBadge source={alert.source} />
          <AlertStatusBadge status={alert.status} size="lg" />
        </div>
      </div>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Alert Header Banner */}
      <div className="bg-white border border-[#D9E2EC] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <AlertSeverityBadge severity={alert.severity} size="lg" />
              <span className="font-mono text-xs text-[#64748B] px-2 py-0.5 rounded-md bg-slate-100">
                {alert.alertType}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight pt-1">
              {alert.productName}
            </h1>
            <p className="text-xs text-[#64748B]">
              SKU: <span className="font-mono font-bold text-[#0F172A]">{alert.sku}</span> •
              Category: <span className="font-semibold text-[#0F172A]">{alert.category}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {alert.status === 'ACTIVE' && (
              <button
                onClick={handleAcknowledge}
                disabled={isActionInProgress}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#1769C2] bg-[#E8F2FF] hover:bg-blue-100 border border-[#BFDBFE] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {actionLoading === 'ACKNOWLEDGE' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Acknowledging...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge Alert</span>
                  </>
                )}
              </button>
            )}

            {alert.status !== 'RESOLVED' && (
              <button
                onClick={handleResolve}
                disabled={isActionInProgress}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-emerald-800 bg-[#D1FAE5] hover:bg-emerald-200 border border-emerald-300 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {actionLoading === 'RESOLVE' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resolving...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Resolve Alert</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Alert Message Box */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#D9E2EC] text-sm text-[#0F172A] flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1769C2] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-xs uppercase tracking-wider text-[#64748B] mb-0.5">
              Warning Message
            </span>
            <p className="font-medium text-xs sm:text-sm">{alert.message}</p>
          </div>
        </div>
      </div>

      {/* Grid: Stock Information & Lifecycle Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Stock Status & Threshold Metrics */}
        <div className="bg-white border border-[#D9E2EC] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              Stock Overview
            </h2>
            <Link
              to={`/products/${alert.productId}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1769C2] hover:underline"
            >
              <span>Product Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                Current Stock
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-2xl font-extrabold ${
                    alert.currentStock === 0
                      ? 'text-red-600'
                      : alert.currentStock <= alert.minimumStock * 0.5
                      ? 'text-orange-600'
                      : 'text-amber-600'
                  }`}
                >
                  {alert.currentStock}
                </span>
                <span className="text-xs text-[#64748B] font-semibold">
                  {alert.unit}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                Minimum Stock
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-[#0F172A]">
                  {alert.minimumStock}
                </span>
                <span className="text-xs text-[#64748B] font-semibold">
                  {alert.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Threshold Progress Gauge */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-[#64748B] font-semibold">
              <span>Threshold Capacity</span>
              <span>
                {alert.minimumStock > 0
                  ? `${Math.round((alert.currentStock / alert.minimumStock) * 100)}% of Min`
                  : '0%'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${sevConfig.barColor}`}
                style={{
                  width: `${Math.min(
                    100,
                    alert.minimumStock > 0
                      ? (alert.currentStock / alert.minimumStock) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={`/inventory/history?productId=${alert.productId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition"
            >
              <History className="w-3.5 h-3.5 text-[#1769C2]" />
              <span>View Inventory Audit Trail</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Alert Lifecycle & Audit Log */}
        <div className="bg-white border border-[#D9E2EC] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#D9E2EC]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              Alert Lifecycle
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Created At */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <Clock className="w-4 h-4 text-[#1769C2] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F172A] block">Created At</span>
                <p className="text-[#64748B]">{formatFullDateTime(alert.createdAt)}</p>
                <span className="text-[10px] text-[#64748B]">
                  ({formatTimeAgo(alert.createdAt)})
                </span>
              </div>
            </div>

            {/* Acknowledged Status */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F172A] block">Acknowledgement</span>
                {alert.acknowledgedAt ? (
                  <>
                    <p className="text-[#0F172A] font-semibold">
                      {alert.acknowledgedBy?.name || 'Staff User'}
                    </p>
                    <p className="text-[#64748B]">{formatFullDateTime(alert.acknowledgedAt)}</p>
                  </>
                ) : (
                  <p className="text-amber-700 font-medium">Pending acknowledgement</p>
                )}
              </div>
            </div>

            {/* Resolved Status */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F172A] block">Resolution</span>
                {alert.resolvedAt ? (
                  <>
                    <p className="text-emerald-700 font-bold">Resolved</p>
                    <p className="text-[#64748B]">{formatFullDateTime(alert.resolvedAt)}</p>
                  </>
                ) : (
                  <p className="text-red-700 font-medium">Condition still active</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;
