/**
 * Centralized Inventory Constants & Config
 * 
 * Reusable transaction types, badges, and source configurations.
 */

export const TRANSACTION_TYPES = Object.freeze({
  ALL: 'ALL',
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  ADJUSTMENT: 'ADJUSTMENT'
});

export const TRANSACTION_CONFIG = {
  STOCK_IN: {
    label: 'Stock In',
    color: 'emerald',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    prefix: '+'
  },
  STOCK_OUT: {
    label: 'Stock Out',
    color: 'blue',
    text: 'text-[#1769C2]',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeClass: 'text-[#1769C2] bg-blue-50 border-blue-200',
    prefix: ''
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    color: 'amber',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    prefix: ''
  }
};

export const TRANSACTION_SOURCES = Object.freeze({
  ALL: 'ALL',
  MANUAL: 'MANUAL',
  IOT: 'IOT'
});
