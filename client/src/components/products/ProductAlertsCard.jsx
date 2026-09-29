import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, ShieldCheck, ArrowUpRight, Loader2 } from 'lucide-react';
import alertService from '../../services/alert.service.js';

/**
 * ProductAlertsCard component.
 * Displays product-specific alerts and provides authorized action triggers
 * (Acknowledge, Resolve) through the existing Alert API.
 */
export const ProductAlertsCard = ({ alerts = [], onAlertUpdated }) => {
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleAcknowledge = async (alertId) => {
    try {
      setProcessingId(alertId);
      setActionError(null);
      await alertService.acknowledgeAlert(alertId);
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to acknowledge alert.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      setProcessingId(alertId);
      setActionError(null);
      await alertService.resolveAlert(alertId);
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to resolve alert.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1769C2]" />
              <span>Product Alerts</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#64748B] border border-[#D9E2EC]">
              {alerts.length} total
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Active and resolved stock alerts associated with this item
          </p>
        </div>

        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-[#dbeafe] border border-[#BFDBFE] rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <span>View All Alerts</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-1">
          <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">No alerts for this product.</p>
          <p className="text-[11px] text-[#64748B]">
            Inventory levels are operating within standard parameters without warning conditions.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D9E2EC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-2.5 px-3">Alert Type</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Source</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {alerts.map((alert) => {
                const isActive = alert.status === 'ACTIVE';
                const isAcknowledged = alert.status === 'ACKNOWLEDGED';
                const isResolved = alert.status === 'RESOLVED';
                const isBusy = processingId === alert.id;

                let severityBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                if (alert.severity === 'CRITICAL' || alert.severity === 'OUT_OF_STOCK') {
                  severityBadge = 'bg-rose-100 text-rose-800 border-rose-300';
                }

                let statusBadge = 'bg-red-50 text-red-700 border-red-200';
                if (isAcknowledged) {
                  statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                } else if (isResolved) {
                  statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                }

                return (
                  <tr key={alert.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${alert.severity === 'CRITICAL' || alert.severity === 'OUT_OF_STOCK' ? 'text-rose-600' : 'text-amber-500'}`} />
                        <span>{(alert.alertType || 'ALERT').replace(/_/g, ' ')}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${severityBadge}`}>
                        {alert.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusBadge}`}>
                        {alert.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-[10px] text-[#64748B]">
                      {alert.source || 'SYSTEM'}
                    </td>

                    <td className="py-2.5 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      <span className="text-[10px]">
                        {new Date(alert.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                      {alert.resolvedAt ? (
                        <>
                          {new Date(alert.resolvedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          <span className="text-[10px]">
                            {new Date(alert.resolvedAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isResolved ? (
                        <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                              {isBusy ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Acknowledge'}
                            </button>
                          )}
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={isBusy}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            {isBusy ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Resolve'}
                          </button>
                        </div>
                      )}
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

export default ProductAlertsCard;
