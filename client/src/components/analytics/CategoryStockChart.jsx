import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Layers, AlertCircle } from 'lucide-react';

const CATEGORY_COLORS = [
  '#1769C2',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#14B8A6',
  '#F97316'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">
          {data.category}
        </p>
        <p className="text-slate-300">
          Current Stock: <span className="font-bold text-emerald-400">{data.currentStock} units</span>
        </p>
        <p className="text-slate-300">
          Minimum Threshold: <span className="font-bold text-slate-200">{data.minimumStock} units</span>
        </p>
        <p className="text-slate-300">
          Products: <span className="font-bold text-white">{data.productCount}</span>
        </p>
        {data.lowStockCount > 0 && (
          <p className="text-amber-400 font-semibold">
            {data.lowStockCount} item{data.lowStockCount > 1 ? 's' : ''} in low/critical stock
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const CategoryStockChart = ({ categories = [] }) => {
  const hasData = categories && categories.length > 0;

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Current Stock by Category</h3>
            <p className="text-[11px] text-[#64748B]">Aggregated unit inventory by department</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#64748B] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
          {categories.length} Categories
        </span>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl my-2">
          <AlertCircle className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold">No category data available</p>
        </div>
      ) : (
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="currentStock" name="Current Stock" radius={[6, 6, 0, 0]}>
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CategoryStockChart;
