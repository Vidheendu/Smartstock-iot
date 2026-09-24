import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Cpu, LogOut, Shield, User, Mail, Radio, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-800/90 border border-slate-700/70 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>[SIMULATED IoT PROTOTYPE]</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Dashboard Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SmartStock Dashboard</h1>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authentication successful.</span>
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Authenticated User
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/40">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Full Name</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Unknown'}</p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/40">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{user?.email || 'Unknown'}</p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/40">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Role</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                  user?.role === 'MANAGER'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Phase 2 Role Verification Link */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold text-indigo-300">Role-Based Access Verification</h3>
            <p className="text-xs text-slate-400">
              Test accessing the Manager-only protected endpoint.
            </p>
          </div>
          <Link
            to="/manager-test"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shrink-0"
          >
            <span>Test Manager Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Note */}
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-xs text-slate-500 text-center">
          Phase 2 Foundation: Full inventory metrics, products, and IoT simulation engines will be introduced in subsequent phases.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
