import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Settings as SettingsIcon,
  Radio,
  TriangleAlert,
  CircleAlert,
  PackageX,
  Info,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeAgo.js';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/iot': 'IoT Monitor',
  '/alerts': 'Alerts',
  '/analytics': 'Analytics',
  '/forecast': 'Forecast',
  '/restocking': 'Restocking',
  '/suppliers': 'Suppliers',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/manager-test': 'Manager Access Test'
};

export const Topbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const displayTitle = title || ROUTE_TITLES[location.pathname] || 'Dashboard';
  const isManager = user?.role === 'MANAGER';

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setNotifDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNotificationClick = async (notif) => {
    setNotifDropdownOpen(false);
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id);
      } catch {
        // Continue navigation
      }
    }
    if (notif.alertId) {
      navigate(`/alerts/${notif.alertId}`);
    } else {
      navigate('/notifications');
    }
  };

  const handleMarkAllReadClick = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
    } catch {
      // Handled in context
    }
  };

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'CRITICAL_STOCK':
        return <CircleAlert className="w-4 h-4 text-orange-600 shrink-0" />;
      case 'OUT_OF_STOCK':
        return <PackageX className="w-4 h-4 text-red-600 shrink-0" />;
      case 'SYSTEM':
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="h-18 bg-white border-b border-[#D9E2EC] px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0 shadow-xs">
      {/* Left section: Hamburger button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#D9E2EC] transition cursor-pointer"
          aria-label="Open mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Compact logo on mobile screens on clean light background */}
        <Link to="/dashboard" className="lg:hidden flex items-center p-1 rounded-lg bg-white">
          <img
            src="/logo-icon.png"
            alt="SmartStock-IoT"
            className="h-8 w-auto object-contain"
          />
        </Link>

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A]">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Right section: Prototype badge, Notifications & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Prototype Indicator (desktop) - Clean Light Blue with Emerald Accent */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] text-xs font-bold">
          <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse shrink-0" />
          <span>SIMULATED IoT PROTOTYPE</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => {
              setNotifDropdownOpen((prev) => !prev);
              setDropdownOpen(false);
            }}
            className={`relative p-2.5 rounded-xl border transition cursor-pointer ${
              notifDropdownOpen
                ? 'bg-[#E8F2FF] text-[#1769C2] border-[#BFDBFE]'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border-[#D9E2EC]'
            }`}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={notifDropdownOpen}
          >
            <Bell className="w-4 h-4" />
            {/* Unread count badge: hidden when 0, shows 99+ if > 99 */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#D9E2EC] shadow-2xl shadow-slate-200/80 py-0 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#D9E2EC] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#0F172A]">Notifications</h2>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-[#64748B]">
                      All caught up
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllReadClick}
                    className="text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] flex items-center gap-1 transition cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                {recentNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-1">
                    <Bell className="w-6 h-6 mx-auto text-[#94A3B8]" />
                    <p className="text-xs font-semibold text-[#0F172A]">No notifications yet</p>
                    <p className="text-[11px] text-[#64748B]">Stock events will appear here</p>
                  </div>
                ) : (
                  recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                        notif.isRead
                          ? 'bg-white hover:bg-[#F8FAFC]'
                          : 'bg-[#F0F7FF] hover:bg-[#E2EEFC]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {renderNotifIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs font-bold truncate ${
                              notif.isRead ? 'text-[#0F172A]' : 'text-[#1769C2]'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#64748B] shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-[#475569] line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>

                        {notif.productName && (
                          <div className="mt-1">
                            <span className="inline-block px-1.5 py-0.2 bg-white border border-[#D9E2EC] rounded text-[10px] font-semibold text-[#0F172A]">
                              {notif.productName}
                            </span>
                          </div>
                        )}
                      </div>

                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#1769C2] mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-[#D9E2EC] bg-[#F8FAFC] text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold text-[#1769C2] hover:text-[#1257A0] hover:bg-white rounded-xl transition border border-transparent hover:border-[#BFDBFE]"
                >
                  <span>View All Notifications</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen((prev) => !prev);
              setNotifDropdownOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-[#D9E2EC] bg-white hover:bg-[#F8FAFC] transition cursor-pointer text-left shadow-xs"
            aria-expanded={dropdownOpen}
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-xl bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            {/* Name and Role (hidden on tiny screens) */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#0F172A] leading-tight truncate max-w-[130px]">
                {user?.name || 'User'}
              </p>
              <span
                className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[10px] font-bold ${
                  isManager
                    ? 'bg-[#D1FAE5] text-emerald-800 border border-emerald-300'
                    : 'bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]'
                }`}
              >
                {user?.role || 'STAFF'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#D9E2EC] shadow-xl shadow-slate-200/60 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Details */}
              <div className="px-4 py-3 border-b border-[#D9E2EC]">
                <p className="text-xs font-bold text-[#0F172A] truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {user?.email || ''}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isManager
                        ? 'bg-[#D1FAE5] text-emerald-800 border border-emerald-300'
                        : 'bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]'
                    }`}
                  >
                    Role: {user?.role || 'STAFF'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0F172A] hover:text-[#1769C2] hover:bg-[#F8FAFC] transition"
                >
                  <User className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0F172A] hover:text-[#1769C2] hover:bg-[#F8FAFC] transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Settings</span>
                </Link>
                {isManager && (
                  <Link
                    to="/manager-test"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1769C2] hover:bg-[#E8F2FF] transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#1769C2]" />
                    <span>Manager Access Test</span>
                  </Link>
                )}
              </div>

              {/* Divider & Logout */}
              <div className="pt-1 border-t border-[#D9E2EC]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
