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
    <header className="h-18 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0 shadow-xs">
      {/* Left section: Hamburger button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#102A43] hover:bg-[#F4F8FC] border border-[#E2E8F0] transition cursor-pointer"
          aria-label="Open mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Compact logo on mobile screens */}
        <Link to="/dashboard" className="lg:hidden flex items-center">
          <img
            src="/logo-icon.png"
            alt="SmartStock-IoT"
            className="h-8 w-auto object-contain"
          />
        </Link>

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#102A43]">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Right section: Prototype badge, Notifications & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Prototype Indicator (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FC] border border-[#E2E8F0] text-[#1769C2] text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
          <span>[SIMULATED IoT PROTOTYPE]</span>
        </div>

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative p-2.5 rounded-xl text-[#64748B] hover:text-[#102A43] hover:bg-[#F4F8FC] border border-[#E2E8F0] transition"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Emerald notification ping badge */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-white" />
        </Link>

        {/* User Profile Area */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-[#F4F8FC] transition cursor-pointer text-left shadow-xs"
            aria-expanded={dropdownOpen}
          >
            {/* User Avatar with brand gradient */}
            <div className="w-8 h-8 rounded-xl gradient-brand text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            {/* Name and Role (hidden on tiny screens) */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#102A43] leading-tight truncate max-w-[130px]">
                {user?.name || 'User'}
              </p>
              <span
                className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[10px] font-bold ${
                  isManager
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-royalblue-50 text-[#1769C2] border border-[#1769C2]/20'
                }`}
              >
                {user?.role || 'STAFF'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl shadow-slate-200/60 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Details */}
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#102A43] truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {user?.email || ''}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isManager
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-royalblue-50 text-[#1769C2] border border-[#1769C2]/20'
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
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#102A43] hover:text-[#1769C2] hover:bg-[#F4F8FC] transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Profile & Settings</span>
                </Link>
                {isManager && (
                  <Link
                    to="/manager-test"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1769C2] hover:bg-royalblue-50 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#1769C2]" />
                    <span>Manager Access Test</span>
                  </Link>
                )}
              </div>

              {/* Divider & Logout */}
              <div className="pt-1 border-t border-[#E2E8F0]">
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
