import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Cpu, Lock, Mail, User, Shield, AlertCircle, Loader2 } from 'lucide-react';

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
        state: { message: 'Registration successful. Please login.' }
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur border border-slate-700/70 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 mb-2">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SmartStock</h1>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            Create your account
          </p>
          <p className="text-xs text-slate-400">
            Register as store staff or inventory manager
          </p>
        </div>

        {/* Server Error Notice */}
        {serverError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className={`w-full bg-slate-900/60 border ${
                  errors.name ? 'border-red-500' : 'border-slate-700'
                } rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
              Password (Min 8 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-slate-900/60 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                } rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="STAFF">STAFF (Store Operator)</option>
                <option value="MANAGER">MANAGER (Inventory Manager)</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-xs text-red-400 mt-1">{errors.role}</p>
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
                <span>Registering account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-2 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
