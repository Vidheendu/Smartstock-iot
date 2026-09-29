import React from 'react';
import { Package, Inbox, Search } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`bg-white border border-dashed border-[#D9E2EC] rounded-2xl p-8 sm:p-12 text-center space-y-3.5 shadow-2xs ${className}`}
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F2FF] border border-[#BFDBFE] text-[#1769C2] flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">{title}</h3>
        {description && (
          <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] border border-[#D9E2EC] text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <span>{actionText}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
