import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Construction, LayoutDashboard } from 'lucide-react';

export const PlaceholderPage = ({
  title = 'Page Under Development',
  description = 'This feature will be implemented in a later phase.',
  icon: Icon = Construction,
  phase = 'Upcoming Milestone',
  roleRequired
}) => {
  return (
    <div className="py-8 px-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="max-w-lg w-full bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm text-center space-y-6">
        {/* Icon & Phase Badge */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1769C2]/10 border border-[#1769C2]/20 text-[#1769C2] flex items-center justify-center shadow-sm">
            <Icon className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#102A43] border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-[#1769C2]" />
            <span>{phase}</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#102A43]">
            {title}
          </h2>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
          {roleRequired && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 py-1 px-3 rounded-lg inline-block font-medium">
              Access Restricted to: <span className="font-bold">{roleRequired}</span>
            </p>
          )}
        </div>

        {/* Roadmap Info Box */}
        <div className="p-4 bg-[#F4F8FC] rounded-xl border border-[#E2E8F0] text-left text-xs text-[#64748B] space-y-1.5">
          <p className="text-[#102A43] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            SmartStock Development Roadmap:
          </p>
          <p className="text-[11px] leading-relaxed text-[#64748B]">
            SmartStock-IoT incorporates real-time telemetry, automated replenishment, and predictive alerts.
            This module is reserved for subsequent iterative rollout according to project specifications.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1769C2] to-[#10B981] hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
