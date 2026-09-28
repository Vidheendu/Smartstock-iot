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
import { BarChart3, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isDeficit = data.currentStock <= data.minimumStock;
    const deficitUnits = data.minimumStock - data.currentStock;

    return (
      <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-[170px]">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 truncate max-w-[200px]">
          {data.name}
        </p>
        <div className="flex items-center justify-between text-slate-300">
          <span>Current Stock:</span>
          <span className="font-bold text-emerald-400">{data.currentStock} {data.unit}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Minimum Stock:</span>
          <span className="font-bold text-slate-200">{data.minimumStock} {data.unit}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Status:</span>
          <span
            className={`font-bold ${
              data.stockStatus === 'NORMAL'
                ? 'text-emerald-400'
                : data.stockStatus === 'LOW'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {data.stockStatus}
          </span>
        </div>
        {isDeficit && (
          <div className="border-t border-slate-700 pt-1 text-red-400 font-semibold text-[11px]">
            Deficit: {deficitUnits} units below minimum
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ProductStockChart = ({ products = [] }) => {
  // Sort or take top 10 products if list is large so the chart stays legible
  const displayProducts = [...products]
    .sort((a, b) => (a.currentStock / (a.minimumStock || 1)) - (b.currentStock / (b.minimumStock || 1)))
    .slice(0, 10);

  const hasData = displayProducts && displayProducts.length > 0;

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Product Stock vs Minimum</h3>
            <p className="text-[11px] text-[#64748B]">
              Comparison of current stock against minimum safety threshold
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#64748B] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
          {products.length} Products
        </span>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl my-2">
          <AlertCircle className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold">No product data available</p>
        </div>
      ) : (
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayProducts}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis
                type="number"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={26}
                formatter={(value) => (
                  <span className="text-[11px] font-semibold text-[#0F172A] ml-1">{value}</span>
                )}
              />
              <Bar
                dataKey="currentStock"
                name="Current Stock"
                fill="#10B981"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="minimumStock"
                name="Minimum Threshold"
                fill="#94A3B8"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProductStockChart;
