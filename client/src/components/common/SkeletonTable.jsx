import React from 'react';

/**
 * SkeletonTable component.
 * Displays pulse skeleton rows inside tables while data is loading.
 */
export const SkeletonTable = ({ rows = 5, cols = 6, headerCols = [] }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#D9E2EC] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse">
        {headerCols.length > 0 && (
          <thead>
            <tr className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
              {headerCols.map((h, i) => (
                <th key={i} className="py-3 px-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[#D9E2EC]">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx} className="animate-pulse">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <td key={cIdx} className="py-3.5 px-3.5">
                  <div
                    className="h-3.5 bg-slate-200 rounded-md"
                    style={{
                      width: cIdx === 0 ? '70%' : cIdx === cols - 1 ? '40%' : '55%'
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
