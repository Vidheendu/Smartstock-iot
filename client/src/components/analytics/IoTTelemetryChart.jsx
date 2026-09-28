import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  RadioTower,
  Radio,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/alertConstants.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0F172A] text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
          {data.displayDate || label}
        </p>
        <p className="text-cyan-400 font-semibold">
          Simulated Readings: <span className="text-white font-bold">{data.readings}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const IoTTelemetryChart = ({ iotData, rangeLabel = 'Selected Period' }) => {
  const summary = iotData?.summary || {
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    totalReadings: 0,
    readingsInRange: 0,
    averageBattery: 0,
    latestReadingTime: null
  };

  const devices = iotData?.devices || [];
  const timeline = iotData?.timeline || [];
  const hasTimeline = timeline.length > 0;

  const getBatteryIcon = (level) => {
    if (level > 70) return <Battery className="w-3.5 h-3.5 text-emerald-600" />;
    if (level > 30) return <BatteryWarning className="w-3.5 h-3.5 text-amber-600" />;
    return <BatteryWarning className="w-3.5 h-3.5 text-red-600" />;
  };

  const getBatteryBadgeClass = (level) => {
    if (level > 70) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (level > 30) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs space-y-5">
      {/* SIMULATED IoT DATA Banner (Mandatory Part 20 requirement) */}
      <div className="p-3.5 rounded-xl bg-[#E8F2FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#BFDBFE] flex items-center justify-center text-[#1769C2] shrink-0">
            <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#1769C2] tracking-wide uppercase">
                SIMULATED IoT DATA
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-[#D1FAE5] border border-emerald-300 px-2 py-0.2 rounded-full">
                Software Simulation
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              All sensors, load cells, weight scales, and battery levels are software-simulated store prototypes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#64748B]">
          <Clock className="w-3.5 h-3.5 text-[#1769C2]" />
          <span>Last Feed: {summary.latestReadingTime ? formatTimeAgo(summary.latestReadingTime) : 'None'}</span>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-bold text-[#64748B] uppercase">Total Devices</p>
          <p className="text-lg font-black text-[#0F172A] mt-0.5">{summary.totalDevices}</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-[10px] font-bold text-emerald-700 uppercase">Online</p>
          <p className="text-lg font-black text-emerald-900 mt-0.5">{summary.onlineDevices}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-bold text-slate-600 uppercase">Offline / Idle</p>
          <p className="text-lg font-black text-slate-800 mt-0.5">{summary.offlineDevices}</p>
        </div>

        <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200">
          <p className="text-[10px] font-bold text-cyan-700 uppercase">Telemetry Readings</p>
          <p className="text-lg font-black text-cyan-900 mt-0.5">{summary.totalReadings}</p>
        </div>

        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-[#1769C2] uppercase">Avg Battery</p>
          <p className="text-lg font-black text-blue-900 mt-0.5">{summary.averageBattery}%</p>
        </div>
      </div>

      {/* Grid: Telemetry Activity Chart & Battery Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Telemetry Readings Per Day */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-xs font-bold text-[#0F172A]">Telemetry Activity</span>
            </div>
            <span className="text-[11px] text-[#64748B]">
              Daily sensor feeds over {rangeLabel.toLowerCase()}
            </span>
          </div>

          {!hasTimeline ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
              <AlertCircle className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-semibold">No telemetry data available for this period.</p>
            </div>
          ) : (
            <div className="h-48 w-full">
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
                    dataKey="readings"
                    name="Readings"
                    fill="#0284C7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Simulated Battery Overview */}
        <div className="space-y-3 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-4 pt-3 lg:pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-[#0F172A]">Simulated Battery</span>
            </div>
            <span className="text-[10px] font-semibold text-[#64748B]">Per Device</span>
          </div>

          <div className="space-y-2">
            {devices.map((d) => (
              <div
                key={d.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#0F172A]">{d.deviceCode}</p>
                  <p className="text-[10px] text-[#64748B] truncate max-w-[140px]">{d.productName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        d.batteryLevel > 70
                          ? 'bg-emerald-500'
                          : d.batteryLevel > 30
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${d.batteryLevel}%` }}
                    />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBatteryBadgeClass(
                      d.batteryLevel
                    )}`}
                  >
                    {getBatteryIcon(d.batteryLevel)}
                    {d.batteryLevel}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Activity Table */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-[#0F172A] mb-2">Simulated Device Activity</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#64748B] font-bold uppercase text-[10px] tracking-wider bg-slate-50/70">
                <th className="py-2 px-3">Device</th>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-right">Last Reading</th>
                <th className="py-2 px-3 text-center">Battery</th>
                <th className="py-2 px-3 text-right">Total Feeds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#0F172A] font-mono">{dev.deviceCode}</span>
                    <span className="text-[10px] text-[#64748B] block">{dev.deviceName}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{dev.productName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dev.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dev.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {dev.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-[#0F172A]">
                    {dev.lastReading}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBatteryBadgeClass(
                        dev.batteryLevel
                      )}`}
                    >
                      {getBatteryIcon(dev.batteryLevel)}
                      {dev.batteryLevel}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-[#0F172A]">
                    {dev.readingsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IoTTelemetryChart;
