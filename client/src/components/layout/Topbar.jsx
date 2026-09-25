import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Settings as SettingsIcon,
  Radio
} from 'lucide-react';

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
  '/manager-test': 'Manager Access Test'
};

export const Topbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayTitle = title || ROUTE_TITLES[location.pathname] || 'Dashboard';
  const isManager = user?.role === 'MANAGER';

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0">
      {/* Left section: Hamburger button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Open mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{displayTitle}</span>
          </h1>
        </div>
      </div>

      {/* Right section: Prototype badge, Notifications & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Prototype Indicator (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          <span>[SIMULATED IoT PROTOTYPE]</span>
        </div>

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Notification ping badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
        </Link>

        {/* User Profile Area */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer text-left"
            aria-expanded={dropdownOpen}
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            {/* Name and Role (hidden on tiny screens) */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {user?.name || 'User'}
              </p>
              <span
                className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[10px] font-bold ${
                  isManager
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {user?.role || 'STAFF'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Details */}
              <div className="px-4 py-2.5 border-b border-slate-700/60">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email || ''}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isManager
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    Role: {user?.role || 'STAFF'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-1">
                <Link
                  to={isManager ? '/settings' : '/dashboard'}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Settings</span>
                </Link>
                {isManager && (
                  <Link
                    to="/manager-test"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manager Access Test</span>
                  </Link>
                )}
              </div>

              {/* Divider & Logout */}
              <div className="pt-1 border-t border-slate-700/60">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
