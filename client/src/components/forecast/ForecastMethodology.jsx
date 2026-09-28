import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Calculator, ShieldCheck } from 'lucide-react';

export const ForecastMethodology = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#D9E2EC] rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] shrink-0 mt-0.5 sm:mt-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0F172A]">How this forecast works</h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded-full">
                Rule-Based Methodology
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Deterministic consumption rate calculations based strictly on recorded store stock-out history.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1769C2] hover:bg-[#E8F2FF] rounded-lg transition self-start sm:self-auto cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Details' : 'Methodology Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#D9E2EC] space-y-3.5 text-xs text-[#0F172A] animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-[#1769C2] block">1. Total Consumed</span>
              <p className="text-[#64748B] text-[11px]">
                SmartStock filters <span className="font-mono text-slate-700 font-semibold">inventory_history</span> for <span className="font-semibold text-slate-800">STOCK_OUT</span> transactions within the selected calendar window (7, 30, or 90 days).
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-[#1769C2] block">2. Average Daily Consumption</span>
              <p className="text-[#64748B] text-[11px]">
                <span className="font-bold font-mono">ADC = Total Consumed / Period Days</span>. Reflects the average on-shelf depletion velocity per calendar day.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-[#1769C2] block">3. Projected Depletion</span>
              <p className="text-[#64748B] text-[11px]">
                <span className="font-bold font-mono">Days = Current Stock / ADC</span>. The projected depletion date is computed by projecting remaining days forward from today.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-bold">Transparent Rule-Based Model: </span>
              This calculation is a deterministic rule-based estimate and not a machine-learning prediction. IoT telemetry decreases are not treated blindly as consumption to prevent artificial double-counting.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastMethodology;
