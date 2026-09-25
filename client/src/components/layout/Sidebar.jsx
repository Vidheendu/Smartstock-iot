import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
    }`;

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 shrink-0">
            <RadioTower className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white truncate">
              SmartStock
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              Smart Inventory Monitoring
            </p>
          </div>
        </div>

        {/* Prototype Indicator */}
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
          <Radio className="w-3 h-3 animate-pulse text-indigo-400 shrink-0" />
          <span className="truncate">SIMULATED IoT PROTOTYPE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
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
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                Management
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs shrink-0">
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
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
