import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, User, Shield, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!['STAFF', 'MANAGER'].includes(formData.role)) {
      errs.role = 'Role must be STAFF or MANAGER';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      // Redirect to login with confirmation
      navigate('/login', {
        state: { message: 'Registration successful. Please sign in.' }
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message || err.message || 'Registration failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#102A43] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 space-y-6">
        {/* Header with Official Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="SmartStock-IoT"
              className="h-16 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#102A43]">
              Create an Account
            </h1>
            <p className="text-xs text-[#64748B]">
              Register as Store Staff or Inventory Manager
            </p>
          </div>
        </div>

        {/* Server Error Notice */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#102A43] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className={`w-full bg-[#F4F8FC] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#102A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] transition ${
                  errors.name ? 'border-red-400' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#102A43] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@smartstock.com"
                className={`w-full bg-[#F4F8FC] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#102A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] transition ${
                  errors.email ? 'border-red-400' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#102A43] uppercase tracking-wider mb-1.5">
              System Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'STAFF' }))}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  formData.role === 'STAFF'
                    ? 'border-[#1769C2] bg-royalblue-50 text-[#1769C2] shadow-xs'
                    : 'border-[#E2E8F0] bg-[#F4F8FC] text-[#64748B] hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Floor Staff</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'MANAGER' }))}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  formData.role === 'MANAGER'
                    ? 'border-[#10B981] bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-[#E2E8F0] bg-[#F4F8FC] text-[#64748B] hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Store Manager</span>
              </button>
            </div>
            {errors.role && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.role}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#102A43] uppercase tracking-wider mb-1.5">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-[#F4F8FC] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#102A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] transition ${
                  errors.password ? 'border-red-400' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#102A43] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-[#F4F8FC] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#102A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769C2]/30 focus:border-[#1769C2] transition ${
                  errors.confirmPassword ? 'border-red-400' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white gradient-brand hover:opacity-95 shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#64748B]">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-[#1769C2] font-bold hover:text-[#10B981] transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
