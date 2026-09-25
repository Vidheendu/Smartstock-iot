import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Package,
  Boxes,
  RadioTower,
  TriangleAlert,
  BarChart3,
  TrendingDown,
  ShoppingCart,
  Truck,
  Bell,
  Settings,
  LogOut,
  Radio,
  User,
  Shield
} from 'lucide-react';

export const MAIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
  { name: 'IoT Monitor', path: '/iot', icon: RadioTower },
  { name: 'Alerts', path: '/alerts', icon: TriangleAlert },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Forecast', path: '/forecast', icon: TrendingDown },
  { name: 'Notifications', path: '/notifications', icon: Bell }
];

export const MANAGER_NAV_ITEMS = [
  { name: 'Restocking', path: '/restocking', icon: ShoppingCart },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const Sidebar = ({ onNavClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isManager = user?.role === 'MANAGER';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'gradient-brand text-white shadow-md shadow-emerald-500/20'
        : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`;

  return (
    <aside className="w-64 h-full bg-[#0B1F3A] border-r border-[#1e3a5f] flex flex-col justify-between text-white">
      {/* Brand Header with Official Logo */}
      <div className="p-5 border-b border-[#1e3a5f]">
        <Link to="/" onClick={onNavClick} className="block">
          <img
            src="/logo.png"
            alt="SmartStock-IoT Logo"
            className="h-11 w-auto object-contain brightness-110"
          />
        </Link>

        {/* Prototype Indicator */}
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-emerald-400 text-[10px] font-bold">
          <Radio className="w-3 h-3 animate-pulse text-[#10B981] shrink-0" />
          <span className="truncate">SIMULATED IoT PROTOTYPE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Main Menu
          </span>
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavClick}
                className={navItemClass}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Management Section (Manager only) */}
        {isManager && (
          <div className="space-y-1 pt-3 border-t border-[#1e3a5f]">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Management
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MANAGER
              </span>
            </div>
            {MANAGER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavClick}
                  className={navItemClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* User & Logout Footer */}
      <div className="p-3.5 border-t border-[#1e3a5f] bg-[#071527]/70">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isManager
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#1769C2]/20 text-[#1769C2] border border-[#1769C2]/30'
                  }`}
                >
                  {user?.role || 'STAFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-xl border border-red-500/30 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
