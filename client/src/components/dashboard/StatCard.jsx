import React from 'react';

/**
 * Color variant configurations based on SmartStock semantic color guidelines:
 * - indigo: General metrics (e.g. Total Products)
 * - amber: Low Stock (warning)
 * - orange: Critical Stock (urgent)
 * - red: Out of Stock (danger)
 */
const COLOR_VARIANTS = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    iconBg: 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30',
    valueText: 'text-white'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconBg: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    valueText: 'text-amber-300'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    iconBg: 'bg-orange-600/20 text-orange-400 border border-orange-500/30',
    valueText: 'text-orange-300'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconBg: 'bg-red-600/20 text-red-400 border border-red-500/30',
    valueText: 'text-red-400'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    valueText: 'text-emerald-300'
  }
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'indigo',
  subtitle,
  badge
}) => {
  const styles = COLOR_VARIANTS[variant] || COLOR_VARIANTS.indigo;

  return (
    <div
      className={`rounded-2xl p-5 border bg-slate-800/80 backdrop-blur ${styles.border} transition-all duration-200 hover:border-slate-600 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className={`text-3xl font-bold tracking-tight ${styles.valueText}`}>
          {value}
        </span>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles.bg} ${styles.text} border ${styles.border}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
