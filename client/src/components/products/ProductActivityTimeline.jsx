import React, { useState } from 'react';
import {
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Radio,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  PackageCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function formatEventTimestamp(isoString) {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isToday) return `Today ${timeStr}`;
  if (isYesterday) return `Yesterday ${timeStr}`;

  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${timeStr}`;
}

const EVENT_ICONS = {
  STOCK_IN: { icon: ArrowDownLeft, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  STOCK_OUT: { icon: ArrowUpRight, color: 'text-[#1769C2] bg-blue-50 border-blue-200' },
  ADJUSTMENT: { icon: RefreshCw, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  IOT_READING: { icon: Radio, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  ALERT_CREATED: { icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ALERT_RESOLVED: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  RESTOCK_CREATED: { icon: ShoppingCart, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  RESTOCK_RECEIVED: { icon: PackageCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
};

/**
 * ProductActivityTimeline component.
 * Combines recent real-database events (stock changes, IoT readings, alerts, restock orders)
 * into a chronological timeline sorted newest first.
 */
export const ProductActivityTimeline = ({ activities = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleActivities = showAll ? activities : activities.slice(0, 10);

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1769C2]" />
            <span>Recent Activity</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Chronological audit stream of stock movements, IoT events, alerts, and restock actions
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Newest First
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-1">
          <p className="text-xs font-semibold text-[#0F172A]">No recent activity recorded.</p>
          <p className="text-[11px] text-[#64748B]">
            Product activity events will appear here automatically when actions occur.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {visibleActivities.map((act) => {
            const config = EVENT_ICONS[act.type] || {
              icon: Clock,
              color: 'text-slate-600 bg-slate-50 border-slate-200'
            };
            const Icon = config.icon;

            return (
              <div key={act.id} className="relative flex items-start gap-3">
                {/* Timeline Node Icon */}
                <div
                  className={`absolute -left-6 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 ${config.color}`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="min-w-0 flex-1 bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl p-3 text-xs shadow-2xs hover:border-[#BFDBFE] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-[#0F172A] truncate">
                      {act.title}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B] whitespace-nowrap">
                      {formatEventTimestamp(act.timestamp)}
                    </span>
                  </div>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    {act.description}
                  </p>
                  {act.source && (
                    <span className="inline-block text-[9px] font-bold text-[#94A3B8] uppercase mt-1">
                      Source: {act.source}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {activities.length > 10 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-[#dbeafe] rounded-lg border border-[#BFDBFE] transition cursor-pointer"
              >
                <span>{showAll ? 'Show Less' : `View More (${activities.length - 10} more)`}</span>
                {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductActivityTimeline;
