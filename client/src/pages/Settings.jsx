import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as authService from '../services/auth.service.js';
import * as settingsService from '../services/settings.service.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/common/Badge.jsx';
import {
  User,
  Shield,
  KeyRound,
  Bell,
  Sliders,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Edit3,
  Calendar,
  Lock,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isManager = user?.role === 'MANAGER';

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

  // ---------------------------------------------------------------------------
  // SECTION 1: PROFILE STATE & HANDLERS
  // ---------------------------------------------------------------------------
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user?.name]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);

    const trimmed = profileName.trim();
    if (!trimmed) {
      setProfileError('Full name is required.');
      return;
    }

    if (trimmed.length > 100) {
      setProfileError('Full name cannot exceed 100 characters.');
      return;
    }

    setProfileLoading(true);

    try {
      const response = await authService.updateProfile({ name: trimmed });
      if (response.success && response.user) {
        updateUser(response.user);
        toast.success('Profile updated successfully.');
        setIsEditingProfile(false);
      } else {
        setProfileError(response.message || 'Unable to update profile.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to update profile.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileName(user?.name || '');
    setProfileError(null);
    setIsEditingProfile(false);
  };

  // ---------------------------------------------------------------------------
  // SECTION 2: SECURITY / CHANGE PASSWORD STATE & HANDLERS
  // ---------------------------------------------------------------------------
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setShowPasswordForm(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password is too short. It must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (response.success) {
        toast.success('Password changed successfully.');
        resetPasswordForm();
      } else {
        setPasswordError(response.message || 'Failed to change password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to change password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 3: NOTIFICATION PREFERENCES STATE & HANDLERS
  // ---------------------------------------------------------------------------
  const [notifPreferences, setNotifPreferences] = useState({
    low_stock_enabled: true,
    critical_stock_enabled: true,
    out_of_stock_enabled: true,
    system_notifications_enabled: true
  });
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSavingKey, setNotifSavingKey] = useState(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setNotifLoading(true);
        const data = await settingsService.getPreferences();
        if (data && data.preferences) {
          setNotifPreferences({
            low_stock_enabled: Boolean(data.preferences.low_stock_enabled ?? true),
            critical_stock_enabled: Boolean(data.preferences.critical_stock_enabled ?? true),
            out_of_stock_enabled: Boolean(data.preferences.out_of_stock_enabled ?? true),
            system_notifications_enabled: Boolean(data.preferences.system_notifications_enabled ?? true)
          });
        }
      } catch (err) {
        console.warn('[SETTINGS] Error fetching preferences, using defaults:', err.message);
      } finally {
        setNotifLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleTogglePreference = async (key) => {
    const updatedValue = !notifPreferences[key];
    const prev = { ...notifPreferences };
    const updated = { ...notifPreferences, [key]: updatedValue };

    // Optimistic UI update
    setNotifPreferences(updated);
    setNotifSavingKey(key);

    try {
      await settingsService.updatePreferences(updated);
      toast.success('Notification preferences updated.');
    } catch (err) {
      // Revert on error
      setNotifPreferences(prev);
      const msg = err.response?.data?.message || err.message || 'Unable to save notification preferences.';
      toast.error(msg);
    } finally {
      setNotifSavingKey(null);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 4: APPLICATION PREFERENCES (WORKSPACE CONFIG)
  // ---------------------------------------------------------------------------
  const [appPreferences, setAppPreferences] = useState(() => ({
    autoRefreshInterval: localStorage.getItem('smartstock_refresh_interval') || '10',
    telemetryAlerts: localStorage.getItem('smartstock_telemetry_alerts') !== 'false',
    compactDensity: localStorage.getItem('smartstock_density') === 'compact'
  }));

  const handleSaveAppPreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('smartstock_refresh_interval', appPreferences.autoRefreshInterval);
    localStorage.setItem('smartstock_telemetry_alerts', String(appPreferences.telemetryAlerts));
    localStorage.setItem('smartstock_density', appPreferences.compactDensity ? 'compact' : 'comfortable');
    toast.success('Workspace preferences have been saved successfully.');
  };

  // ---------------------------------------------------------------------------
  // SECTION 5: ACCOUNT LOGOUT
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile information, password security, notification alerts, and application preferences."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2FF] text-[#1769C2] border border-[#BFDBFE]">
            Account & System Config
          </span>
        }
      />

      {/* ========================================================================= */}
      {/* 1. PROFILE SECTION                                                        */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#1769C2] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Profile</h2>
              <p className="text-xs text-[#64748B]">Personal details and system access level.</p>
            </div>
          </div>

          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#D9E2EC] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1769C2]" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {profileError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{profileError}</span>
          </div>
        )}

        {isEditingProfile ? (
          /* Profile Edit Mode */
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div>
              <label htmlFor="settingsProfileName" className="block text-xs font-bold text-[#0F172A] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="settingsProfileName"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                disabled={profileLoading}
                required
                maxLength={100}
                className="w-full px-3 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
              />
            </div>

            <div>
              <label htmlFor="settingsProfileEmail" className="block text-xs font-bold text-[#64748B] mb-1">
                Email
              </label>
              <input
                id="settingsProfileEmail"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#64748B] cursor-not-allowed"
              />
              <span className="text-[11px] text-amber-700 mt-1 block">
                Email changes are not available.
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] disabled:bg-[#94A3B8] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelProfile}
                disabled={profileLoading}
                className="px-3.5 py-2 border border-[#D9E2EC] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Profile Read-Only Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Full Name
              </span>
              <span className="font-bold text-[#0F172A] block text-sm truncate">
                {user?.name || 'Vidheendu'}
              </span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Email
              </span>
              <span className="font-semibold text-[#0F172A] block text-xs truncate">
                {user?.email || 'user@example.com'}
              </span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Role
              </span>
              <div className="pt-0.5">
                <Badge
                  status={isManager ? 'ACTIVE' : 'NORMAL'}
                  customLabel={user?.role || 'STAFF'}
                  size="sm"
                />
              </div>
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
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. SECURITY SECTION (CHANGE PASSWORD)                                     */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Security</h2>
              <p className="text-xs text-[#64748B]">Manage your account password and authentication credentials.</p>
            </div>
          </div>

          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#D9E2EC] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{passwordError}</span>
          </div>
        )}

        {showPasswordForm ? (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPasswordInput" className="block text-xs font-bold text-[#0F172A] mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="currentPasswordInput"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPasswordInput" className="block text-xs font-bold text-[#0F172A] mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPasswordInput"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full pl-3 pr-10 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPasswordInput" className="block text-xs font-bold text-[#0F172A] mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPasswordInput"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                  minLength={8}
                  placeholder="Confirm matching password"
                  className="w-full pl-3 pr-10 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] disabled:bg-[#94A3B8] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetPasswordForm}
                disabled={passwordLoading}
                className="px-3.5 py-2 border border-[#D9E2EC] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC]">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Password
              </span>
              <span className="font-mono text-sm tracking-wider text-[#0F172A]">
                ••••••••••••
              </span>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-xs font-bold text-[#1769C2] hover:underline cursor-pointer"
            >
              Update
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. NOTIFICATIONS SECTION                                                  */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#D9E2EC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Notifications</h2>
              <p className="text-xs text-[#64748B]">
                Configure which automated alerts generate future in-app notifications for your account.
              </p>
            </div>
          </div>

          {notifLoading && (
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1769C2]" />
              <span>Loading...</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Low Stock Alerts */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC]">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-[#0F172A] block">Low Stock Alerts</span>
              <span className="text-[11px] text-[#64748B] block">
                Receive notifications when inventory falls below defined reorder levels.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifPreferences.low_stock_enabled}
              aria-label="Toggle low stock alerts"
              disabled={notifLoading || notifSavingKey === 'low_stock_enabled'}
              onClick={() => handleTogglePreference('low_stock_enabled')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/30 ${
                notifPreferences.low_stock_enabled ? 'bg-[#1769C2]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  notifPreferences.low_stock_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Critical Stock Alerts */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC]">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-[#0F172A] block">Critical Stock Alerts</span>
              <span className="text-[11px] text-[#64748B] block">
                Receive high-urgency notifications when stock reaches critically low thresholds.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifPreferences.critical_stock_enabled}
              aria-label="Toggle critical stock alerts"
              disabled={notifLoading || notifSavingKey === 'critical_stock_enabled'}
              onClick={() => handleTogglePreference('critical_stock_enabled')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/30 ${
                notifPreferences.critical_stock_enabled ? 'bg-[#1769C2]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  notifPreferences.critical_stock_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Out of Stock Alerts */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC]">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-[#0F172A] block">Out of Stock Alerts</span>
              <span className="text-[11px] text-[#64748B] block">
                Receive instant notifications when any product reaches zero stock units.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifPreferences.out_of_stock_enabled}
              aria-label="Toggle out of stock alerts"
              disabled={notifLoading || notifSavingKey === 'out_of_stock_enabled'}
              onClick={() => handleTogglePreference('out_of_stock_enabled')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/30 ${
                notifPreferences.out_of_stock_enabled ? 'bg-[#1769C2]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  notifPreferences.out_of_stock_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* System Notifications */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#D9E2EC]">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-[#0F172A] block">System Notifications</span>
              <span className="text-[11px] text-[#64748B] block">
                Receive platform broadcasts, restock status changes, and IoT simulation events.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifPreferences.system_notifications_enabled}
              aria-label="Toggle system notifications"
              disabled={notifLoading || notifSavingKey === 'system_notifications_enabled'}
              onClick={() => handleTogglePreference('system_notifications_enabled')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/30 ${
                notifPreferences.system_notifications_enabled ? 'bg-[#1769C2]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  notifPreferences.system_notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#64748B] italic">
          Note: Disabling a preference prevents new future notifications. Existing historical notifications remain securely saved in your inbox.
        </p>
      </section>

      {/* ========================================================================= */}
      {/* 4. APPLICATION PREFERENCES SECTION                                        */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSaveAppPreferences} className="space-y-6">
          <div className="pb-4 border-b border-[#D9E2EC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769C2] flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Application Preferences</h2>
                <p className="text-xs text-[#64748B]">Adjust workspace ergonomics and telemetry polling intervals.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="telemetryIntervalSelect" className="block text-xs font-bold text-[#0F172A] mb-1">
                Simulated Device Telemetry Polling Rate
              </label>
              <select
                id="telemetryIntervalSelect"
                value={appPreferences.autoRefreshInterval}
                onChange={(e) =>
                  setAppPreferences((p) => ({ ...p, autoRefreshInterval: e.target.value }))
                }
                className="w-full max-w-sm px-3 py-2 text-xs border border-[#D9E2EC] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1769C2]/20 focus:border-[#1769C2]"
              >
                <option value="5">Every 5 Seconds (High Frequency)</option>
                <option value="10">Every 10 Seconds (Recommended)</option>
                <option value="30">Every 30 Seconds (Low Bandwidth)</option>
                <option value="0">Manual Refresh Only</option>
              </select>
              <p className="text-[11px] text-[#64748B] mt-1">
                Governs telemetry refresh rate on IoT simulation pages.
              </p>
            </div>

            <div className="pt-3 border-t border-[#D9E2EC] space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appPreferences.telemetryAlerts}
                  onChange={(e) =>
                    setAppPreferences((p) => ({ ...p, telemetryAlerts: e.target.checked }))
                  }
                  className="w-4 h-4 mt-0.5 rounded text-[#1769C2] focus:ring-[#1769C2]/20 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0F172A] block">Auto-generate toast feedback on inventory changes</span>
                  <span className="text-[#64748B] text-[11px] block">Displays instant visual feedback whenever stock levels are modified</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appPreferences.compactDensity}
                  onChange={(e) =>
                    setAppPreferences((p) => ({ ...p, compactDensity: e.target.checked }))
                  }
                  className="w-4 h-4 mt-0.5 rounded text-[#1769C2] focus:ring-[#1769C2]/20 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0F172A] block">Compact Table Row Density</span>
                  <span className="text-[#64748B] text-[11px] block">Reduces table padding to maximize data density on standard screens</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D9E2EC] flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1769C2] hover:bg-[#1257A0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* 5. ACCOUNT / LOGOUT SECTION                                               */}
      {/* ========================================================================= */}
      <section className="bg-white border border-red-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-red-700">Account Session</h2>
            <p className="text-xs text-[#64748B]">
              Sign out of this browser session. You will be redirected to the login screen.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-red-500/20 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
