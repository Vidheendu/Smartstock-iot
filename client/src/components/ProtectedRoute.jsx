import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/30 rounded-2xl p-6 text-center shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-300">
            You do not have permission to access this page.
          </p>
          <p className="text-xs text-slate-400">
            Required role: <span className="font-mono text-amber-300 font-semibold">{allowedRoles.join(', ')}</span><br />
            Your role: <span className="font-mono text-slate-300 font-semibold">{user?.role}</span>
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
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
