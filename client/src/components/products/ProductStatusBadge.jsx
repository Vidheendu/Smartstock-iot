import React from 'react';
import { STOCK_STATUS_CONFIG } from '../../utils/productConstants.js';

export const ProductStatusBadge = ({ status }) => {
  const normalizedKey = status ? String(status).toUpperCase().replace(/\s+/g, '_') : 'NORMAL';
  const config = STOCK_STATUS_CONFIG[normalizedKey] || STOCK_STATUS_CONFIG.NORMAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${config.bg} ${config.text} ${config.border}`}
      title={config.description}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normalizedKey === 'CRITICAL' || normalizedKey === 'OUT_OF_STOCK'
            ? 'animate-pulse bg-current'
            : 'bg-current'
        }`}
      />
      <span>{config.label}</span>
    </span>
  );
};

export default ProductStatusBadge;
