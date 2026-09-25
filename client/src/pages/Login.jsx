import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#D9E2EC] rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 space-y-6">
        {/* Header with Official Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block p-1 rounded-xl bg-white">
            <img
              src="/logo.png"
              alt="SmartStock-IoT"
              className="h-16 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Welcome Back
            </h1>
            <p className="text-xs text-[#64748B]">
              Sign in to access your store inventory dashboard
            </p>
          </div>
        </div>

        {/* Success Notice from Registration */}
        {successMessage && (
          <div className="p-3 bg-[#D1FAE5] border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Server Error Notice */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@smartstock.com"
                className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition ${
                  errors.email ? 'border-red-400' : 'border-[#D9E2EC]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition ${
                  errors.password ? 'border-red-400' : 'border-[#D9E2EC]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit Button - Solid Blue #1769C2 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1769C2] hover:bg-[#1257A0] shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Hint */}
        <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#D9E2EC] text-[11px] text-[#64748B] space-y-1">
          <p className="font-semibold text-[#0F172A]">Quick Test Accounts:</p>
          <div className="flex items-center justify-between text-[11px]">
            <span>Manager: <strong className="text-[#0F172A]">manager@smartstock.com</strong></span>
            <button
              type="button"
              onClick={() => {
                setEmail('manager@smartstock.com');
                setPassword('password123');
              }}
              className="text-[#1769C2] font-bold hover:underline cursor-pointer"
            >
              Fill
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Staff: <strong className="text-[#0F172A]">staff@smartstock.com</strong></span>
            <button
              type="button"
              onClick={() => {
                setEmail('staff@smartstock.com');
                setPassword('password123');
              }}
              className="text-[#1769C2] font-bold hover:underline cursor-pointer"
            >
              Fill
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#64748B]">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="text-[#1769C2] font-bold hover:text-[#1257A0] transition"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
