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

export const AlertCard = ({
  alert,
  actionLoading = {},
  onAcknowledge,
  onResolve
}) => {
  const isAcknowledging = actionLoading[alert.id] === 'ACKNOWLEDGE';
  const isResolving = actionLoading[alert.id] === 'RESOLVE';
  const isActionInProgress = Boolean(actionLoading[alert.id]);

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-3">
      {/* Top Header: Severity + Status */}
      <div className="flex items-center justify-between gap-2">
        <AlertSeverityBadge severity={alert.severity} />
        <div className="flex items-center gap-1.5">
          <AlertSourceBadge source={alert.source} />
          <AlertStatusBadge status={alert.status} />
        </div>
      </div>

      {/* Product & SKU */}
      <div>
        <Link
          to={`/products/${alert.productId}`}
          className="font-bold text-sm text-[#0F172A] hover:text-[#1769C2] transition"
        >
          {alert.productName}
        </Link>
        <p className="font-mono text-[11px] text-[#64748B]">
          {alert.sku} • {alert.category}
        </p>
      </div>

      {/* Message */}
      <p className="text-xs text-[#334155] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#D9E2EC]">
        {alert.message}
      </p>

      {/* Stock metrics pill bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Current Stock
          </span>
          <span
            className={`text-sm font-extrabold ${
              alert.currentStock === 0
                ? 'text-red-600'
                : alert.currentStock <= (alert.minimumStock * 0.5)
                ? 'text-orange-600'
                : 'text-amber-600'
            }`}
          >
            {alert.currentStock} {alert.unit}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Minimum Stock
          </span>
          <span className="text-sm font-bold text-[#0F172A]">
            {alert.minimumStock} {alert.unit}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
        <span>Triggered:</span>
        <span title={formatFullDateTime(alert.createdAt)}>
          {formatTimeAgo(alert.createdAt)}
        </span>
      </div>

      {/* Action Buttons at bottom */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#D9E2EC]">
        <Link
          to={`/alerts/${alert.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-slate-100 border border-[#D9E2EC] rounded-xl transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>

        {alert.status === 'ACTIVE' && (
          <button
            onClick={() => onAcknowledge && onAcknowledge(alert.id)}
            disabled={isActionInProgress}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1769C2] bg-[#E8F2FF] hover:bg-blue-100 border border-[#BFDBFE] rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {isAcknowledging ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Acknowledging...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </>
            )}
          </button>
        )}

        {alert.status !== 'RESOLVED' && (
          <button
            onClick={() => onResolve && onResolve(alert.id)}
            disabled={isActionInProgress}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resolving...</span>
              </>
            ) : (
              <>
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
