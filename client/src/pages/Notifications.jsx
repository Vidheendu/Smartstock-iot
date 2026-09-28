import React, { useState, useMemo } from 'react';
import { useNotifications } from '../context/NotificationContext.jsx';
import NotificationCard from '../components/notifications/NotificationCard.jsx';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  TriangleAlert,
  CircleAlert,
  PackageX,
  Inbox
} from 'lucide-react';

export const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'CRITICAL_STOCK' | 'OUT_OF_STOCK'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setActionMessage('All notifications marked as read.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setActionMessage('Unable to mark all as read.');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Filter and search computation
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. Status Filter
      if (statusFilter === 'UNREAD' && notif.isRead) return false;
      if (statusFilter === 'READ' && !notif.isRead) return false;

      // 2. Type Filter
      if (typeFilter !== 'ALL' && notif.type !== typeFilter) return false;

      // 3. Search Filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = notif.title?.toLowerCase().includes(query);
        const matchesMessage = notif.message?.toLowerCase().includes(query);
        const matchesProduct = notif.productName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, statusFilter, typeFilter, searchQuery]);

  // Counts for tabs
  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E2EC]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
                {unreadCount} unread
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-[#64748B] border border-slate-200">
                All caught up
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Stay updated on important inventory events.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-blue-100 border border-[#BFDBFE] rounded-xl transition cursor-pointer shadow-xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
            title="Refresh notifications"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing || loading ? 'animate-spin text-[#1769C2]' : 'text-[#64748B]'
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast/Banner */}
      {actionMessage && (
        <div className="p-3 bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="font-bold underline hover:text-red-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Controls & Filters Bar */}
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs space-y-4">
        {/* Top row: Search & Status Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, title or message..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D9E2EC] focus:outline-hidden focus:ring-2 focus:ring-[#1769C2] focus:border-transparent placeholder:text-[#94A3B8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#D9E2EC]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'UNREAD'
                  ? 'bg-white text-[#1769C2] shadow-xs border border-[#BFDBFE]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1769C2] text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('READ')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'READ'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-[#D9E2EC]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Read ({readCount})
            </button>
          </div>
        </div>

        {/* Bottom row: Type Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-[#64748B] font-semibold text-[11px] mr-1 hidden sm:inline">
            Type:
          </span>
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-[#475569]'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('LOW_STOCK')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
              typeFilter === 'LOW_STOCK'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <TriangleAlert className="w-3 h-3" />
            <span>Low Stock</span>
          </button>
          <button
            onClick={() => setTypeFilter('CRITICAL_STOCK')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
              typeFilter === 'CRITICAL_STOCK'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200'
            }`}
          >
            <CircleAlert className="w-3 h-3" />
            <span>Critical</span>
          </button>
          <button
            onClick={() => setTypeFilter('OUT_OF_STOCK')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
              typeFilter === 'OUT_OF_STOCK'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <PackageX className="w-3 h-3" />
            <span>Out of Stock</span>
          </button>
        </div>
      </div>

      {/* 4. Notification List Section */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-[#D9E2EC]">
            <Loader2 className="w-7 h-7 animate-spin text-[#1769C2]" />
            <p className="text-xs font-bold text-[#0F172A]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty States (PART 42) */
          <div className="py-16 px-4 bg-white rounded-2xl border border-[#D9E2EC] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#94A3B8]">
              {searchQuery ? (
                <Search className="w-6 h-6" />
              ) : statusFilter === 'UNREAD' ? (
                <CheckCheck className="w-6 h-6 text-emerald-500" />
              ) : (
                <Inbox className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {searchQuery
                  ? 'No notifications match your search.'
                  : statusFilter === 'UNREAD'
                  ? "You're all caught up."
                  : statusFilter === 'READ'
                  ? 'No read notifications.'
                  : typeFilter !== 'ALL'
                  ? 'No notifications match your filter.'
                  : 'No notifications yet.'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No alerts found matching "${searchQuery}". Try different keywords.`
                  : statusFilter === 'UNREAD'
                  ? 'You have reviewed all incoming stock alerts and inventory events.'
                  : 'Inventory alerts generated by telemetry or threshold violations will appear here.'}
              </p>
            </div>

            {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] border border-[#BFDBFE] rounded-xl transition cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onMarkRead={markAsRead}
              onMarkUnread={markAsUnread}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
