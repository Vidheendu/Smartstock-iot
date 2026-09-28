import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ArrowLeftRight, TrendingUp, TrendingDown, Sliders, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[160px]">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
          {data.displayDate || label}
        </p>
        <div className="flex items-center justify-between text-emerald-400">
          <span>Stock In:</span>
          <span className="font-bold">+{data.stockIn}</span>
        </div>
        <div className="flex items-center justify-between text-[#38BDF8]">
          <span>Stock Out:</span>
          <span className="font-bold">-{data.stockOut}</span>
        </div>
        <div className="flex items-center justify-between text-purple-400">
          <span>Adjustments:</span>
          <span className="font-bold">
            {data.adjustments >= 0 ? `+${data.adjustments}` : data.adjustments}
          </span>
        </div>
        <div className="border-t border-slate-700 pt-1 flex items-center justify-between font-bold text-white">
          <span>Net Change:</span>
          <span className={data.net >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {data.net >= 0 ? `+${data.net}` : data.net}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const InventoryMovementChart = ({ movementData, rangeLabel = 'Selected Period' }) => {
  const summary = movementData?.summary || {
    totalStockIn: 0,
    totalStockOut: 0,
    totalAdjustments: 0,
    netMovement: 0,
    totalTransactions: 0
  };

  const timeline = movementData?.timeline || [];
  const hasData = timeline.length > 0 && summary.totalTransactions > 0;

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D9E2EC] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2]">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Inventory Movement</h3>
            <p className="text-[11px] text-[#64748B]">
              Stock-in vs stock-out activity over {rangeLabel.toLowerCase()}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#64748B] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
          {summary.totalTransactions} Transaction{summary.totalTransactions !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-800">Stock In</p>
            <p className="text-sm font-black text-emerald-950">+{summary.totalStockIn}</p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-[#1769C2]">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-800">Stock Out</p>
            <p className="text-sm font-black text-blue-950">-{summary.totalStockOut}</p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-purple-800">Adjustments</p>
            <p className="text-sm font-black text-purple-950">
              {summary.totalAdjustments >= 0 ? `+${summary.totalAdjustments}` : summary.totalAdjustments}
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-700">Net Movement</p>
            <p
              className={`text-sm font-black ${
                summary.netMovement > 0
                  ? 'text-emerald-700'
                  : summary.netMovement < 0
                  ? 'text-red-700'
                  : 'text-slate-800'
              }`}
            >
              {summary.netMovement >= 0 ? `+${summary.netMovement}` : summary.netMovement}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl my-2">
          <AlertCircle className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold">No inventory activity available for this period.</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
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
              <Legend
                verticalAlign="bottom"
                height={30}
                formatter={(value) => (
                  <span className="text-[11px] font-semibold text-[#0F172A] ml-1">{value}</span>
                )}
              />
              <Line
                type="monotone"
                name="Stock In"
                dataKey="stockIn"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10B981' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                name="Stock Out"
                dataKey="stockOut"
                stroke="#1769C2"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1769C2' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                name="Adjustment"
                dataKey="adjustments"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default InventoryMovementChart;
