import React from 'react';
import { RESTOCK_STATUS_CONFIG } from '../../utils/restockConstants.js';

export default function RestockStatusBadge({ status }) {
  const config = RESTOCK_STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
