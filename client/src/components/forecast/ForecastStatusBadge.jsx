import React from 'react';
import { FORECAST_STATUS_CONFIG } from '../../utils/forecastConstants.js';

export const ForecastStatusBadge = ({ status }) => {
  const config = FORECAST_STATUS_CONFIG[status] || FORECAST_STATUS_CONFIG.NO_DATA;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeClass}`}
      title={config.description}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default ForecastStatusBadge;
