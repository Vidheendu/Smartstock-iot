import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { PieChart as PieIcon, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  NORMAL: '#10B981',
  LOW: '#F59E0B',
  CRITICAL: '#F97316',
  OUT_OF_STOCK: '#EF4444'
};

const STATUS_LABELS = {
  NORMAL: 'Normal',
  LOW: 'Low Stock',
  CRITICAL: 'Critical',
  OUT_OF_STOCK: 'Out of Stock'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0F172A] text-white p-2.5 rounded-xl shadow-lg border border-slate-700 text-xs">
        <p className="font-bold flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.payload.color }}
          />
          {data.name}
        </p>
        <p className="mt-1 text-slate-300 font-medium">
          Products: <span className="font-bold text-white">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const StockStatusChart = ({ distribution, totalProducts }) => {
  const data = [
    {
      name: STATUS_LABELS.NORMAL,
      status: 'NORMAL',
      value: distribution?.NORMAL || 0,
      color: STATUS_COLORS.NORMAL
    },
    {
      name: STATUS_LABELS.LOW,
      status: 'LOW',
      value: distribution?.LOW || 0,
      color: STATUS_COLORS.LOW
    },
    {
      name: STATUS_LABELS.CRITICAL,
      status: 'CRITICAL',
      value: distribution?.CRITICAL || 0,
      color: STATUS_COLORS.CRITICAL
    },
    {
      name: STATUS_LABELS.OUT_OF_STOCK,
      status: 'OUT_OF_STOCK',
      value: distribution?.OUT_OF_STOCK || 0,
      color: STATUS_COLORS.OUT_OF_STOCK
    }
  ].filter((item) => item.value > 0);

  const hasData = data.length > 0 && totalProducts > 0;

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2]">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Stock Status Distribution</h3>
            <p className="text-[11px] text-[#64748B]">Current inventory health status</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#64748B] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
          {totalProducts || 0} Products
        </span>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold">No stock status data available</p>
        </div>
      ) : (
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span className="text-[11px] font-semibold text-[#0F172A] ml-1">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Numerical Quick Summary Grid */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#D9E2EC] text-center">
        <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-700">Normal</p>
          <p className="text-sm font-black text-emerald-900">{distribution?.NORMAL ?? 0}</p>
        </div>
        <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[10px] font-bold text-amber-700">Low</p>
          <p className="text-sm font-black text-amber-900">{distribution?.LOW ?? 0}</p>
        </div>
        <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100">
          <p className="text-[10px] font-bold text-orange-700">Critical</p>
          <p className="text-sm font-black text-orange-900">{distribution?.CRITICAL ?? 0}</p>
        </div>
        <div className="p-1.5 rounded-xl bg-red-50 border border-red-100">
          <p className="text-[10px] font-bold text-red-700">Out of Stock</p>
          <p className="text-sm font-black text-red-900">{distribution?.OUT_OF_STOCK ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default StockStatusChart;
