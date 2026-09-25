import React from 'react';

/**
 * Color variant configurations based on SmartStock-IoT brand guidelines:
 * - blue: General metrics (e.g. Total Products) -> Royal Blue (#1769C2)
 * - amber: Low Stock (warning)
 * - orange: Critical Stock (urgent)
 * - red: Out of Stock (danger)
 * - emerald: Normal / Success -> Emerald Green (#10B981)
 */
const COLOR_VARIANTS = {
  blue: {
    bg: 'bg-royalblue-50',
    border: 'border-royalblue-200',
    text: 'text-[#1769C2]',
    iconBg: 'bg-royalblue-50 text-[#1769C2] border border-royalblue-200',
    valueText: 'text-[#0B1F3A]'
  },
  indigo: {
    bg: 'bg-royalblue-50',
    border: 'border-royalblue-200',
    text: 'text-[#1769C2]',
    iconBg: 'bg-royalblue-50 text-[#1769C2] border border-royalblue-200',
    valueText: 'text-[#0B1F3A]'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
    valueText: 'text-amber-700'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    iconBg: 'bg-orange-50 text-orange-600 border border-orange-200',
    valueText: 'text-orange-700'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    iconBg: 'bg-red-50 text-red-600 border border-red-200',
    valueText: 'text-red-700'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    valueText: 'text-emerald-700'
  }
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'blue',
  subtitle,
  badge
}) => {
  const styles = COLOR_VARIANTS[variant] || COLOR_VARIANTS.blue;

  return (
    <div
      className="rounded-2xl p-5 border border-[#E2E8F0] bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className={`text-3xl font-extrabold tracking-tight ${styles.valueText}`}>
          {value}
        </span>
        {badge && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${styles.bg} ${styles.text} border ${styles.border}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-[#64748B]">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
