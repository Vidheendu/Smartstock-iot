import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TriangleAlert,
  Radio,
  Sliders,
  Cpu,
  AlertCircle,
  BellRing,
  CheckCircle2
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-[150px]">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
          {data.displayDate || label}
        </p>
        <div className="flex items-center justify-between text-amber-400">
          <span>Low Stock:</span>
          <span className="font-bold">{data.lowStock}</span>
        </div>
        <div className="flex items-center justify-between text-orange-400">
          <span>Critical:</span>
          <span className="font-bold">{data.criticalStock}</span>
        </div>
        <div className="flex items-center justify-between text-red-400">
          <span>Out of Stock:</span>
          <span className="font-bold">{data.outOfStock}</span>
        </div>
        <div className="border-t border-slate-700 pt-1 flex items-center justify-between font-bold text-white">
          <span>Total Alerts:</span>
          <span>{data.total}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const AlertTrendChart = ({ alertData, rangeLabel = 'Selected Period' }) => {
  const summary = alertData?.summary || {
    totalAlerts: 0,
    activeAlerts: 0,
    acknowledgedAlerts: 0,
    resolvedAlerts: 0
  };

  const bySource = alertData?.bySource || {
    MANUAL: 0,
    IOT: 0,
    SYSTEM: 0
  };

  const timeline = alertData?.timeline || [];
  const hasData = timeline.length > 0 && summary.totalAlerts > 0;

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D9E2EC] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600">
            <TriangleAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Alert Trends & Sources</h3>
            <p className="text-[11px] text-[#64748B]">
              Warning event frequency and origin breakdown over {rangeLabel.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
            {summary.activeAlerts} Live Active
          </span>
          <span className="text-xs font-bold text-[#64748B] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {summary.totalAlerts} Total Recorded
          </span>
        </div>
      </div>

      {/* Grid: Trend Chart + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Alerts Over Time Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0F172A]">Alerts Over Time</span>
            <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Critical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Out of Stock
              </span>
            </div>
          </div>

          {!hasData ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
              <AlertCircle className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-semibold">No alert history available for this period.</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="lowStock"
                    name="Low Stock"
                    fill="#F59E0B"
                    stackId="alerts"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="criticalStock"
                    name="Critical Stock"
                    fill="#F97316"
                    stackId="alerts"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="outOfStock"
                    name="Out of Stock"
                    fill="#EF4444"
                    stackId="alerts"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Alert Source & Lifecycle Breakdown */}
        <div className="space-y-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-4 pt-3 lg:pt-0">
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] mb-2">Alert Sources</h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-slate-200 text-slate-700">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A]">Manual Transactions</span>
                </div>
                <span className="text-xs font-black text-[#0F172A]">{bySource.MANUAL ?? 0}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-900">Simulated IoT Feeds</span>
                </div>
                <span className="text-xs font-black text-indigo-900">{bySource.IOT ?? 0}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-slate-200 text-slate-600">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">System Evaluations</span>
                </div>
                <span className="text-xs font-black text-slate-900">{bySource.SYSTEM ?? 0}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#64748B] mb-2 uppercase text-[10px]">Lifecycle Status</h4>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-red-50 border border-red-100">
                <p className="text-[10px] font-bold text-red-700">Active</p>
                <p className="text-xs font-black text-red-900">{summary.activeAlerts}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-bold text-[#1769C2]">Acked</p>
                <p className="text-xs font-black text-blue-900">{summary.acknowledgedAlerts}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700">Resolved</p>
                <p className="text-xs font-black text-emerald-900">{summary.resolvedAlerts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertTrendChart;
