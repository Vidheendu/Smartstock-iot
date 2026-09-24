import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Cpu, Lock, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur border border-slate-700/70 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 mb-2">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SmartStock</h1>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            Smart Inventory Monitoring System
          </p>
          <p className="text-xs text-slate-400">
            Sign in to access store inventory and IoT simulation
          </p>
        </div>

        {/* Success Notice from Registration */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Server Error Notice */}
        {serverError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartstock.com"
                className={`w-full bg-slate-900/60 border ${
                  errors.email ? 'border-red-500' : 'border-slate-700'
                } rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-900/60 border ${
                  errors.password ? 'border-red-500' : 'border-slate-700'
                } rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Tip */}
        <div className="p-3 bg-slate-900/40 border border-slate-700/50 rounded-xl text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Demo Accounts (Pre-configured):</p>
          <p>Manager: <span className="text-indigo-300 font-mono">manager@smartstock.com</span> / <span className="font-mono">password123</span></p>
          <p>Staff: <span className="text-indigo-300 font-mono">staff@smartstock.com</span> / <span className="font-mono">password123</span></p>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-2 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
