import React from 'react';
import { RefreshCw, PackagePlus, AlertTriangle, ShoppingCart, Clock, Activity, Inbox } from 'lucide-react';

const ACTIVITY_ICONS = {
  stock_update: {
    icon: RefreshCw,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  product_added: {
    icon: PackagePlus,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  restock: {
    icon: ShoppingCart,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  }
};

export const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-400">
              Audit timeline of recent inventory events and system alerts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/70 text-slate-300 border border-slate-600/50">
            Temporary Mock Data
          </span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-700/60 rounded-xl space-y-2">
          <Inbox className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No recent activity.</p>
          <p className="text-xs text-slate-500">
            Inventory changes, product updates, and alerts will appear here as they occur.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-700/50">
          {activities.map((item) => {
            const style = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.stock_update;
            const Icon = style.icon;

            return (
              <div
                key={item.id}
                className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 hover:bg-slate-750/30 transition rounded-lg px-2 -mx-2"
              >
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${style.bg} ${style.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
