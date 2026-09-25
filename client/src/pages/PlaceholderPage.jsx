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
      <div className="max-w-lg w-full bg-slate-800/80 border border-slate-700/70 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        {/* Icon & Phase Badge */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <Icon className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{phase}</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
          {roleRequired && (
            <p className="text-xs text-amber-400 font-medium">
              Access Restricted to: <span className="font-bold">{roleRequired}</span>
            </p>
          )}
        </div>

        {/* Roadmap Info Box */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 text-left text-xs text-slate-400 space-y-1.5">
          <p className="text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            SmartStock Development Roadmap:
          </p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Phase 3 establishes the primary application shell and navigation framework.
            This module is reserved for subsequent iterative rollout according to project specifications.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
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
