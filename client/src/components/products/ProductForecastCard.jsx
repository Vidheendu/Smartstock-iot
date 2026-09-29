import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, ArrowUpRight, AlertTriangle, AlertCircle, Info, Flame } from 'lucide-react';
import { formatDaysRemaining, formatADC, formatDepletionDate } from '../../utils/forecastConstants.js';

/**
 * ProductForecastCard component.
 * Displays consumption metrics (7/30/90 days) and rule-based stock forecast
 * reusing Phase 10 logic and handling all edge cases.
 */
export const ProductForecastCard = ({ forecast, currentStock = 0, unit = 'units' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const isOutOfStock = Number(currentStock) <= 0;

  const periods = forecast?.periods || {
    '7': { totalConsumed: 0, adc: 0 },
    '30': { totalConsumed: 0, adc: 0 },
    '90': { totalConsumed: 0, adc: 0 }
  };

  const activePeriodData = periods[selectedPeriod] || periods['30'] || { totalConsumed: 0, adc: 0 };
  const hasConsumptionData = Boolean(forecast?.hasData && (periods['30']?.totalConsumed > 0 || periods['7']?.totalConsumed > 0 || periods['90']?.totalConsumed > 0));
  const isLimitedData = Boolean(forecast?.isLimitedData);

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#1769C2]" />
            <span>Stock Forecast & Consumption</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Depletion projections and consumption rates derived from stock-out history
          </p>
        </div>

        <Link
          to="/forecast"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:text-[#1257A0] bg-[#E8F2FF] hover:bg-[#dbeafe] border border-[#BFDBFE] rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <span>View Forecast</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Limited Data Warning Banner */}
      {isLimitedData && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Forecast is based on limited historical data.</span>
        </div>
      )}

      {/* Out of Stock Notice */}
      {isOutOfStock && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Out of Stock</strong>
            <span>Current inventory is zero. Projections will resume once new stock is received.</span>
          </div>
        </div>
      )}

      {/* Grid: Left = Consumption, Right = Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sub-Card 1: Consumption Information */}
        <div className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Consumption</span>
            </h4>

            {/* Period Selector Tabs */}
            <div className="inline-flex bg-white border border-[#D9E2EC] rounded-lg p-0.5 text-[11px] font-semibold">
              {['7', '30', '90'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    selectedPeriod === p
                      ? 'bg-[#1769C2] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {p} Days
                </button>
              ))}
            </div>
          </div>

          {!hasConsumptionData ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs font-semibold text-[#64748B]">No consumption data</p>
              <p className="text-[11px] text-[#94A3B8]">
                No stock-out transactions have been recorded in the observation period.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-[#D9E2EC] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Total Consumed ({selectedPeriod}d)
                </span>
                <span className="text-xl font-extrabold text-[#0F172A] block">
                  {activePeriodData.totalConsumed}{' '}
                  <span className="text-xs font-semibold text-[#64748B]">{unit}</span>
                </span>
              </div>

              <div className="p-3 bg-white border border-[#D9E2EC] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Avg Daily Consumption
                </span>
                <span className="text-xl font-extrabold text-amber-700 block">
                  {activePeriodData.adc}{' '}
                  <span className="text-xs font-semibold text-[#64748B]">{unit}/day</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sub-Card 2: Stock Forecast */}
        <div className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Stock Forecast (30-Day Base)
            </h4>
            <span className="text-[10px] font-semibold text-[#64748B]">
              Forecast Period: 30 days
            </span>
          </div>

          {isOutOfStock ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs font-bold text-rose-600">Out of Stock</p>
              <p className="text-[11px] text-[#64748B]">
                0 days remaining until depletion.
              </p>
            </div>
          ) : !hasConsumptionData ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs font-semibold text-[#64748B]">
                No consumption data available for forecasting.
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Depletion estimates require at least one recorded STOCK_OUT transaction.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#D9E2EC] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  ADC Rate
                </span>
                <span className="text-base font-extrabold text-[#0F172A] block">
                  {formatADC(forecast?.averageDailyConsumption, unit)}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#D9E2EC] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Days Remaining
                </span>
                <span className="text-base font-extrabold text-[#1769C2] block">
                  {formatDaysRemaining(forecast?.estimatedDaysRemaining)}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#D9E2EC] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Projected Depletion
                </span>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {formatDepletionDate(forecast?.projectedDepletionDate)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForecastCard;
