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
import { TrendingDown, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-[140px]">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
          {data.displayDate || label}
        </p>
        <div className="flex items-center justify-between text-blue-400">
          <span>Consumed:</span>
          <span className="font-bold text-white">
            {data.consumed} {unit || 'units'}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-300 text-[10px]">
          <span>Transactions:</span>
          <span>{data.transactionsCount || 1}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ConsumptionChart = ({ timeline = [], unit = 'units', height = 220 }) => {
  const hasData = timeline && timeline.length > 0;

  if (!hasData) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl p-4 text-center"
      >
        <AlertCircle className="w-6 h-6 text-slate-300" />
        <p className="text-xs font-semibold">No consumption records found for this period.</p>
        <p className="text-[11px] text-slate-400 max-w-xs">
          Only recorded stock-out transactions are counted as consumption.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
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
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Bar
            dataKey="consumed"
            name="Consumed"
            fill="#1769C2"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsumptionChart;
