import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowRight,
  Radio,
  Package,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Bell,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#102A43] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="SmartStock-IoT Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-[#64748B]">
          <a href="#features" className="hover:text-[#1769C2] transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-[#1769C2] transition-colors">
            IoT Architecture
          </a>
          <a href="#demo" className="hover:text-[#1769C2] transition-colors">
            Demo Credentials
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-brand hover:opacity-95 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#102A43] hover:text-[#1769C2] transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-brand hover:opacity-95 shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
        {/* Subtle Decorative Background Gradient Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-[#1769C2]/10 via-[#10B981]/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-xs text-xs font-bold text-[#1769C2]">
            <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
            <span>SOFTWARE-SIMULATED IoT STORE INVENTORY SYSTEM</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#102A43] leading-tight">
              Smart Inventory Monitoring with{' '}
              <span className="gradient-text">Real-Time Insights</span>
            </h1>
            <p className="text-base sm:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Eliminate retail stockouts with automated threshold alarms, software-simulated sensor telemetry, and intelligent catalog control.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white gradient-brand hover:opacity-95 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-[#102A43] bg-white hover:bg-slate-50 border border-[#E2E8F0] shadow-sm transition"
            >
              <Package className="w-4 h-4 text-[#1769C2]" />
              <span>Browse Catalog</span>
            </Link>
          </div>

          {/* Hero Feature Card Showcase */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-10 shadow-xl shadow-slate-200/50 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#102A43]">
                      SmartStore Sensor Telemetry
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Simulated weight cells & optical level counters active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    System Healthy
                  </span>
                </div>
              </div>

              {/* 3 Metric highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Active Products
                  </span>
                  <p className="text-2xl font-extrabold text-[#0B1F3A]">10 Items</p>
                  <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Live Database Connected</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Stock Alerts
                  </span>
                  <p className="text-2xl font-extrabold text-[#F59E0B]">2 Low / 3 Crit</p>
                  <p className="text-[11px] text-[#64748B]">
                    Threshold-based notifications
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Access Model
                  </span>
                  <p className="text-2xl font-extrabold text-[#1769C2]">Role-Aware</p>
                  <p className="text-[11px] text-[#64748B]">
                    Manager & Staff permissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 bg-white border-t border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1769C2]">
              Engineered For Modern Stores
            </h2>
            <p className="text-3xl font-extrabold text-[#102A43]">
              Everything you need for intelligent stock control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-4 hover:border-[#1769C2]/40 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#1769C2] shadow-xs">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">
                Four-Tier Stock Status
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Categorizes catalog inventory into Normal, Low, Critical, and Out-of-Stock states based on dynamic minimum thresholds.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-4 hover:border-[#10B981]/40 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#10B981] shadow-xs">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">
                Simulated Telemetry
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Software simulation mimics smart shelf load cells, optical conveyor counters, and RFID scanners with zero physical hardware.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-4 hover:border-[#1769C2]/40 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#1769C2] shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">
                Role-Based Governance
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Granular authorization ensures Store Managers can modify catalog, thresholds, and suppliers while Floor Staff view status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Info Section */}
      <section id="demo" className="py-16 px-4 sm:px-6 lg:px-12 bg-[#F4F8FC]">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-12 shadow-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#102A43]">
              Test Accounts & Pre-Seeded Roles
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Explore the system using either the Manager or Staff pre-seeded credentials:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B1F3A]">STORE MANAGER</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Full CRUD & Settings
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Email: <code className="font-bold text-[#102A43]">manager@smartstock.com</code></p>
              <p className="text-xs text-[#64748B]">Password: <code className="font-bold text-[#102A43]">password123</code></p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F4F8FC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B1F3A]">FLOOR STAFF</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  Read-Only & Audit
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Email: <code className="font-bold text-[#102A43]">staff@smartstock.com</code></p>
              <p className="text-xs text-[#64748B]">Password: <code className="font-bold text-[#102A43]">password123</code></p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white gradient-brand hover:opacity-95 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#0B1F3A] text-white py-12 px-4 sm:px-6 lg:px-12 border-t border-navy-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SmartStock-IoT"
              className="h-9 w-auto brightness-110 object-contain"
            />
          </div>

          <p className="text-xs text-slate-400 text-center sm:text-right">
            SmartStock-IoT Platform • Software-Simulated Store Inventory System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
