import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dateFormatted = data.date
      ? new Date(data.date).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : label;

    return (
      <div className="bg-white p-3 border border-[#D9E2EC] rounded-xl shadow-lg text-xs space-y-1 z-50">
        <p className="font-bold text-[#0F172A] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#1769C2]" />
          <span>{dateFormatted}</span>
        </p>
        <p className="text-emerald-700 font-extrabold text-sm">
          Stock Level: {data.stock} {unit}
        </p>
        {data.type && data.type !== 'INITIAL' && data.type !== 'CURRENT' && (
          <p className="text-[#64748B] text-[11px]">
            Action: <span className="font-semibold text-[#0F172A]">{data.type}</span>{' '}
            ({data.change > 0 ? `+${data.change}` : data.change})
          </p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * StockMovementChart component.
 * Visualizes stock level over time derived strictly from real inventory_history records.
 */
export const StockMovementChart = ({ stockMovement = [], unit = 'units', minimumStock = 0 }) => {
  if (!stockMovement || stockMovement.length === 0) {
    return (
      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1769C2]" />
              <span>Stock Movement</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">Historical stock level over time</p>
          </div>
        </div>
        <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#D9E2EC] space-y-1">
          <AlertCircle className="w-6 h-6 text-[#64748B] mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">No stock movement records yet.</p>
          <p className="text-[11px] text-[#64748B]">
            Movement data will appear here automatically when stock transactions are recorded.
          </p>
        </div>
      </div>
    );
  }

  // Format data for chart display
  const chartData = stockMovement.map((pt, idx) => {
    const d = new Date(pt.date);
    const timeLabel = isNaN(d.getTime())
      ? `Pt ${idx + 1}`
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return {
      ...pt,
      displayDate: timeLabel
    };
  });

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9E2EC]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1769C2]" />
            <span>Stock Movement</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Derived directly from recorded inventory audit movements ({stockMovement.length} data points)
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#1769C2] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769C2]" />
            <span>Stock Level</span>
          </span>
          {minimumStock > 0 && (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <span className="w-3 border-t-2 border-dashed border-amber-500" />
              <span>Min Stock ({minimumStock})</span>
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1769C2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1769C2" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="displayDate"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            {minimumStock > 0 && (
              <ReferenceLine
                y={minimumStock}
                stroke="#D97706"
                strokeDasharray="4 4"
                label={{
                  value: `Min: ${minimumStock}`,
                  fill: '#D97706',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="stock"
              stroke="#1769C2"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#stockGradient)"
              dot={{ r: 3, fill: '#1769C2', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#1769C2' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockMovementChart;
