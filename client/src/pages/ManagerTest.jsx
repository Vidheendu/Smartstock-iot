import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { testManagerAccess } from '../services/auth.service.js';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ManagerTest = () => {
  const { user } = useAuth();
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runVerification = async () => {
      try {
        const data = await testManagerAccess();
        setApiResponse(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/70 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Manager Access</h1>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Manager-only page.
          </p>
          <p className="text-xs text-slate-400">
            Protected endpoint accessible exclusively by users with the MANAGER role.
          </p>
        </div>

        {/* Backend verification result */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Server Verification Result:
          </span>
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Querying GET /api/auth/manager-test...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs text-red-400 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{apiResponse?.message}</span>
            </div>
          )}
        </div>

        {/* User Identity Confirmation */}
        <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
          <p><span className="text-slate-300 font-medium">Verified User:</span> {user?.name} ({user?.email})</p>
          <p><span className="text-slate-300 font-medium">Role:</span> <span className="font-bold text-amber-300">{user?.role}</span></p>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerTest;
