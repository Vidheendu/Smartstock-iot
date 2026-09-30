import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as authService from '../services/auth.service.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/common/Badge.jsx';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const isManager = user?.role === 'MANAGER';

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format account created date
  const formatCreatedDate = (dateStr) => {
    if (!dateStr) return '29 Sep 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '29 Sep 2026';
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '29 Sep 2026';
    }
  };

  const accountCreatedDate = formatCreatedDate(user?.createdAt || user?.created_at);

  const handleStartEdit = () => {
    setFullName(user?.name || '');
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFullName(user?.name || '');
    setError(null);
    setIsEditing(false);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = fullName.trim();
    if (!trimmed) {
      setError('Full name is required.');
      return;
    }

    if (trimmed.length > 100) {
      setError('Full name cannot exceed 100 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.updateProfile({ name: trimmed });
      if (response.success && response.user) {
        updateUser(response.user);
        toast.success('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setError(response.message || 'Unable to update profile.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to update profile.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="User Profile"
        subtitle="View and manage your account identity, security role, and personal details."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
            Verified Account
          </span>
        }
      />

      {/* Profile Hero Header Card */}
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1769C2] to-[#0A3D73] text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  {user?.name || 'Authorized User'}
                </h2>
                <Badge
                  status={isManager ? 'ACTIVE' : 'NORMAL'}
                  customLabel={user?.role || 'STAFF'}
                  size="sm"
                />
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{user?.email || 'N/A'}</span>
              </p>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Member since {accountCreatedDate}</span>
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20 self-start sm:self-auto"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Quick Identity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Full Name
            </span>
            <span className="font-bold text-[#0F172A] truncate block text-sm">
              {user?.name || 'Vidheendu'}
            </span>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Email Address
            </span>
            <span className="font-semibold text-[#0F172A] truncate block text-xs">
              {user?.email || 'user@example.com'}
            </span>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Assigned Role
            </span>
            <span className="font-bold text-[#0F172A] block text-xs">
              {user?.role === 'MANAGER' ? 'MANAGER (Full Access)' : 'STAFF (Operations)'}
            </span>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Account Created
            </span>
            <span className="font-semibold text-[#0F172A] block text-xs">
              {accountCreatedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information & Edit Section */}
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs max-w-4xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E2EC]">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Personal Information</h3>
            <p className="text-xs text-[#64748B]">
              {isEditing
                ? 'Update your name and view non-editable identity fields.'
                : 'Your identity and access control attributes within SmartStock.'}
            </p>
          </div>
          {isEditing && (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
              Editing Mode
            </span>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isEditing ? (
          /* Profile Edit Mode Form */
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="space-y-4 max-w-xl">
              <div>
                <label htmlFor="fullNameInput" className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="fullNameInput"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                    maxLength={100}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D9E2EC] rounded-xl text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2] transition"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Visible on inventory history, restock orders, and system audit logs.
                </p>
              </div>

              <div>
                <label htmlFor="emailInput" className="block text-xs font-bold text-[#64748B] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="emailInput"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#64748B] cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3.5 top-3" />
                </div>
                <p className="text-[11px] text-amber-700 bg-amber-50/70 border border-amber-100 p-2 rounded-lg mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Email changes are not available.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">
                  Assigned Security Role
                </label>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1769C2]" />
                    <span className="text-xs font-bold text-[#0F172A]">
                      {user?.role || 'STAFF'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Read-Only (Managed by Administrator)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D9E2EC] flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1769C2] hover:bg-[#1257A0] disabled:bg-[#94A3B8] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D9E2EC] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          /* Profile Read-Only View Mode */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-2xl">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#64748B]">Full Name</span>
                <p className="text-sm font-bold text-[#0F172A]">{user?.name || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#64748B]">Email Address</span>
                <p className="text-sm font-semibold text-[#0F172A]">{user?.email || 'N/A'}</p>
                <span className="text-[10px] text-[#64748B]">Email changes are not available.</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#64748B]">Role</span>
                <div className="pt-0.5">
                  <Badge
                    status={isManager ? 'ACTIVE' : 'NORMAL'}
                    customLabel={user?.role || 'STAFF'}
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#64748B]">Account Created Date</span>
                <p className="text-sm font-semibold text-[#0F172A]">{accountCreatedDate}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D9E2EC]">
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
