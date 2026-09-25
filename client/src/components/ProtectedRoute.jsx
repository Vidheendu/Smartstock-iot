import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#64748B]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1769C2] mb-3" />
        <p className="text-sm font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">Access Denied</h2>
          <p className="text-sm text-[#64748B]">
            You do not have permission to access this page.
          </p>
          <p className="text-xs text-[#64748B]">
            Required role: <span className="font-mono text-amber-700 font-semibold">{allowedRoles.join(', ')}</span><br />
            Your role: <span className="font-mono text-[#0F172A] font-semibold">{user?.role}</span>
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-sm font-medium rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
