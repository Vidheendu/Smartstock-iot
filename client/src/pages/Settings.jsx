import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  User,
  Shield,
  Sliders,
  Bell,
  Cpu,
  CheckCircle2,
  Save,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/common/Badge.jsx';

export const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isManager = user?.role === 'MANAGER';

  const [activeTab, setActiveTab] = useState('profile');

  // Local preferences state
  const [preferences, setPreferences] = useState(() => {
    return {
      autoRefreshInterval: localStorage.getItem('smartstock_refresh_interval') || '10',
      enableSound: localStorage.getItem('smartstock_sound') === 'true',
      compactDensity: localStorage.getItem('smartstock_density') === 'compact',
      telemetryAlerts: localStorage.getItem('smartstock_telemetry_alerts') !== 'false'
    };
  });

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('smartstock_refresh_interval', preferences.autoRefreshInterval);
    localStorage.setItem('smartstock_sound', String(preferences.enableSound));
    localStorage.setItem('smartstock_density', preferences.compactDensity ? 'compact' : 'comfortable');
    localStorage.setItem('smartstock_telemetry_alerts', String(preferences.telemetryAlerts));

    toast.success('Your workspace preferences have been saved successfully.');
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile credentials, system configurations, and workspace preferences."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
            Workspace Config
          </span>
        }
      />

      {/* Tabs Row */}
      <div className="flex border-b border-[#D9E2EC] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-[#1769C2] text-[#1769C2]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('application')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'application'
              ? 'border-[#1769C2] text-[#1769C2]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Application</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'border-[#1769C2] text-[#1769C2]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#D9E2EC]">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] font-extrabold text-xl flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">{user?.name || 'Authorized User'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#64748B]">{user?.email || 'N/A'}</span>
                <span className="text-xs text-slate-300">•</span>
                <Badge
                  status={isManager ? 'ACTIVE' : 'NORMAL'}
                  customLabel={user?.role || 'STAFF'}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                User Identification ID
              </span>
              <span className="font-mono font-semibold text-[#0F172A] break-all">
                {user?.id || user?.userId || 'e0000000-0000-0000-0000-000000000001'}
              </span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Assigned Role & Permissions
              </span>
              <span className="font-semibold text-[#0F172A] block">
                {isManager ? 'Store Inventory Manager (Full Permissions)' : 'Floor Staff (Read & Stock Adjustments)'}
              </span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Session Status
              </span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Authenticated (JWT)</span>
              </span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Security Policy
              </span>
              <span className="font-semibold text-[#0F172A]">
                Role-Based Access Control (RBAC)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Application Information */}
      {activeTab === 'application' && (
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div className="pb-4 border-b border-[#D9E2EC] space-y-1">
            <h2 className="text-lg font-bold text-[#0F172A]">SmartStock-IoT System Specifications</h2>
            <p className="text-xs text-[#64748B]">
              Core runtime parameters and simulation environment definitions.
            </p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900">
            <Radio className="w-4 h-4 text-[#1769C2] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">SOFTWARE-SIMULATED TELEMETRY:</strong>
              <span>
                SmartStock utilizes software-emulated load cells, optical counters, and RFID sensors. No physical IoT hardware is required.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Application Version</span>
              <span className="font-bold text-[#0F172A]">SmartStock v1.0.0 (Phase 15 Demo Ready)</span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Sensor Simulator Engine</span>
              <span className="font-bold text-emerald-700">Online & Reactive</span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Database Engine</span>
              <span className="font-semibold text-[#0F172A]">Supabase PostgreSQL / Resilient Mock Store</span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Client Framework</span>
              <span className="font-semibold text-[#0F172A]">React 18 + Vite + TailwindCSS + Recharts</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Workspace Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div className="pb-4 border-b border-[#D9E2EC] space-y-1">
            <h2 className="text-lg font-bold text-[#0F172A]">Workspace Preferences</h2>
            <p className="text-xs text-[#64748B]">
              Configure your dashboard display, notifications, and telemetry refresh frequencies.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Simulated Device Telemetry Polling Rate
              </label>
              <select
                value={preferences.autoRefreshInterval}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, autoRefreshInterval: e.target.value }))
                }
                className="w-full max-w-sm px-3 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
              >
                <option value="5">Every 5 Seconds (High Frequency)</option>
                <option value="10">Every 10 Seconds (Recommended)</option>
                <option value="30">Every 30 Seconds (Low Bandwidth)</option>
                <option value="0">Manual Refresh Only</option>
              </select>
              <p className="text-[11px] text-[#64748B] mt-1">
                Controls how frequently telemetry logs poll updates in the IoT Monitor view.
              </p>
            </div>

            <div className="pt-3 border-t border-[#D9E2EC] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.telemetryAlerts}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, telemetryAlerts: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#1769C2] focus:ring-[#1769C2]/20 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0F172A] block">Auto-generate toast feedback on inventory changes</span>
                  <span className="text-[#64748B] text-[11px] block">Displays instant visual feedback whenever stock levels are modified</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.compactDensity}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, compactDensity: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#1769C2] focus:ring-[#1769C2]/20 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0F172A] block">Compact Table Row Density</span>
                  <span className="text-[#64748B] text-[11px] block">Reduces table padding to maximize data density on standard screens</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D9E2EC] flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
