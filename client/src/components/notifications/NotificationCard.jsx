import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TriangleAlert,
  CircleAlert,
  PackageX,
  Info,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  Clock,
  Package
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeAgo.js';
import { NOTIFICATION_CONFIG } from '../../types/notification.js';

export const NotificationCard = ({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete
}) => {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);

  const {
    id,
    type,
    title,
    message,
    isRead,
    createdAt,
    alertId,
    productId,
    productName
  } = notification;

  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEM;

  // Render appropriate icon per Phase 8 specification
  const renderIcon = () => {
    switch (type) {
      case 'LOW_STOCK':
        return <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'CRITICAL_STOCK':
        return <CircleAlert className="w-5 h-5 text-orange-600 shrink-0" />;
      case 'OUT_OF_STOCK':
        return <PackageX className="w-5 h-5 text-red-600 shrink-0" />;
      case 'SYSTEM':
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  const handleToggleRead = async (e) => {
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    try {
      if (isRead) {
        await onMarkUnread?.(id);
      } else {
        await onMarkRead?.(id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await onDelete?.(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardClick = async () => {
    if (!isRead) {
      try {
        await onMarkRead?.(id);
      } catch {
        // Continue navigation even if mark read fails
      }
    }
    if (alertId) {
      navigate(`/alerts/${alertId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 cursor-pointer shadow-xs ${
        isRead
          ? 'bg-white hover:bg-slate-50/80 border-[#D9E2EC]'
          : 'bg-[#F0F7FF] hover:bg-[#E6F0FC] border-[#BFDBFE] ring-1 ring-blue-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Icon, Details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Severity Icon Box */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              type === 'LOW_STOCK'
                ? 'bg-amber-50 border-amber-200'
                : type === 'CRITICAL_STOCK'
                ? 'bg-orange-50 border-orange-200'
                : type === 'OUT_OF_STOCK'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            {renderIcon()}
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-sm font-bold tracking-tight text-[#0F172A] ${
                  !isRead ? 'text-[#0F172A]' : 'text-slate-700'
                }`}
              >
                {title}
              </h3>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}
              >
                {config.label}
              </span>

              {/* Unread indicator badge */}
              {!isRead && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1769C2] text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  New
                </span>
              )}
            </div>

            {/* Notification Message */}
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed break-words">
              {message}
            </p>

            {/* Meta Tags: Product & Timestamp */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#64748B]">
              {productName && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#D9E2EC] font-semibold text-[#0F172A] text-[11px]">
                  <Package className="w-3 h-3 text-[#1769C2]" />
                  <span>{productName}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1 text-[11px] font-medium">
                <Clock className="w-3 h-3 text-[#94A3B8]" />
                <span>{formatTimeAgo(createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div
          className="flex sm:flex-col items-center sm:items-end justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {alertId && (
            <Link
              to={`/alerts/${alertId}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-white hover:bg-blue-50/60 border border-[#BFDBFE] rounded-lg transition"
              title="Open full alert details"
            >
              <span>View Alert</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleRead}
              disabled={actionLoading}
              className={`p-1.5 rounded-lg border transition text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                isRead
                  ? 'text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-slate-50 border-[#D9E2EC]'
                  : 'text-[#1769C2] hover:text-white hover:bg-[#1769C2] bg-white border-[#BFDBFE]'
              }`}
              title={isRead ? 'Mark as unread' : 'Mark as read'}
            >
              {isRead ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Unread</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Read</span>
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="p-1.5 rounded-lg border border-[#D9E2EC] bg-white hover:bg-red-50 text-[#64748B] hover:text-red-600 transition cursor-pointer disabled:opacity-50"
              title="Delete notification"
              aria-label="Delete notification"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
