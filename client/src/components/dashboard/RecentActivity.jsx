import React from 'react';
import { RefreshCw, PackagePlus, AlertTriangle, ShoppingCart, Clock, Activity, Inbox } from 'lucide-react';

const ACTIVITY_ICONS = {
  stock_update: {
    icon: RefreshCw,
    color: 'text-[#1769C2]',
    bg: 'bg-royalblue-50 border-royalblue-200'
  },
  product_added: {
    icon: PackagePlus,
    color: 'text-[#10B981]',
    bg: 'bg-emerald-50 border-emerald-200'
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200'
  },
  restock: {
    icon: ShoppingCart,
    color: 'text-[#0B1F3A]',
    bg: 'bg-slate-100 border-slate-200'
  }
};

export const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-royalblue-50 border border-royalblue-200 text-[#1769C2]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#102A43] tracking-tight">Recent Activity</h2>
            <p className="text-xs text-[#64748B]">
              Audit timeline of recent inventory events and system alerts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F8FC] text-[#64748B] border border-[#E2E8F0]">
            Simulated Audit Stream
          </span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#E2E8F0] rounded-2xl space-y-2">
          <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-[#102A43]">No recent activity.</p>
          <p className="text-xs text-[#64748B]">
            Inventory changes, product updates, and alerts will appear here as they occur.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {activities.map((item) => {
            const style = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.stock_update;
            const Icon = style.icon;

            return (
              <div
                key={item.id}
                className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 hover:bg-[#F4F8FC] transition rounded-xl px-2.5 -mx-2.5"
              >
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${style.bg} ${style.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#102A43] truncate">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
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
