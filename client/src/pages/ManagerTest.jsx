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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white border border-[#D9E2EC] rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Manager Access</h1>
          <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Manager-only page.
          </p>
          <p className="text-xs text-[#64748B]">
            Protected endpoint accessible exclusively by users with the MANAGER role.
          </p>
        </div>

        {/* Backend verification result */}
        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-2">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
            Server Verification Result:
          </span>
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#64748B] py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1769C2]" />
              <span>Querying GET /api/auth/manager-test...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs text-red-600 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-600 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{apiResponse?.message}</span>
            </div>
          )}
        </div>

        {/* User Identity Confirmation */}
        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D9E2EC] text-xs text-[#64748B] space-y-1">
          <p><span className="text-[#0F172A] font-medium">Verified User:</span> {user?.name} ({user?.email})</p>
          <p><span className="text-[#0F172A] font-medium">Role:</span> <span className="font-bold text-amber-700">{user?.role}</span></p>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition"
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
