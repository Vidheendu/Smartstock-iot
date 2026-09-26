import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  CheckCircle,
  CheckCheck,
  Loader2
} from 'lucide-react';
import {
  AlertSeverityBadge,
  AlertStatusBadge,
  AlertSourceBadge
} from './AlertBadges.jsx';
import { formatTimeAgo, formatFullDateTime } from '../../utils/alertConstants.js';

export const AlertTable = ({
  alerts = [],
  actionLoading = {},
  onAcknowledge,
  onResolve
}) => {
  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4 min-w-[200px]">Message</th>
              <th className="py-3.5 px-4 text-right">Current Stock</th>
              <th className="py-3.5 px-4 text-right">Min Stock</th>
              <th className="py-3.5 px-4 text-center">Source</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Created</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E2EC] text-xs text-[#0F172A]">
            {alerts.map((alert) => {
              const isAcknowledging = actionLoading[alert.id] === 'ACKNOWLEDGE';
              const isResolving = actionLoading[alert.id] === 'RESOLVE';
              const isActionInProgress = Boolean(actionLoading[alert.id]);

              return (
                <tr
                  key={alert.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  {/* Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <AlertSeverityBadge severity={alert.severity} />
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-4">
                    <div>
                      <Link
                        to={`/products/${alert.productId}`}
                        className="font-bold text-[#0F172A] hover:text-[#1769C2] transition block"
                      >
                        {alert.productName}
                      </Link>
                      <span className="font-mono text-[10px] text-[#64748B]">
                        {alert.sku}
                      </span>
                    </div>
                  </td>

                  {/* Message */}
                  <td className="py-3.5 px-4 text-xs text-[#334155]">
                    <span className="line-clamp-2">{alert.message}</span>
                  </td>

                  {/* Current Stock */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`font-extrabold ${
                        alert.currentStock === 0
                          ? 'text-red-600'
                          : alert.currentStock <= (alert.minimumStock * 0.5)
                          ? 'text-orange-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {alert.currentStock}
                    </span>
                    <span className="text-[10px] text-[#64748B] ml-1">
                      {alert.unit}
                    </span>
                  </td>

                  {/* Minimum Stock */}
                  <td className="py-3.5 px-4 text-right font-medium text-[#64748B] whitespace-nowrap">
                    {alert.minimumStock} {alert.unit}
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AlertSourceBadge source={alert.source} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <AlertStatusBadge status={alert.status} />
                  </td>

                  {/* Created Timestamp */}
                  <td className="py-3.5 px-4 text-right text-[11px] text-[#64748B] whitespace-nowrap">
                    <span title={formatFullDateTime(alert.createdAt)}>
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <Link
                        to={`/alerts/${alert.id}`}
                        className="p-1.5 text-[#64748B] hover:text-[#1769C2] hover:bg-[#E8F2FF] rounded-lg transition"
                        title="View alert details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Acknowledge Action (Only if ACTIVE) */}
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => onAcknowledge && onAcknowledge(alert.id)}
                          disabled={isActionInProgress}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1769C2] bg-[#E8F2FF] hover:bg-blue-100 border border-[#BFDBFE] rounded-lg transition cursor-pointer disabled:opacity-50"
                          title="Mark alert as acknowledged"
                        >
                          {isAcknowledging ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Acknowledging...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Acknowledge</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Resolve Action (If ACTIVE or ACKNOWLEDGED) */}
                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => onResolve && onResolve(alert.id)}
                          disabled={isActionInProgress}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                          title="Mark alert as resolved"
                        >
                          {isResolving ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Resolving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCheck className="w-3 h-3" />
                              <span>Resolve</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Resolved indicator */}
                      {alert.status === 'RESOLVED' && (
                        <span className="text-[11px] font-semibold text-emerald-600 px-2 py-0.5">
                          Resolved
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertTable;
