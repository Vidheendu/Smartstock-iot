/**
 * Centralized Product Constants
 * 
 * Reusable options for categories, units, and stock statuses across SmartStock.
 */

export const PRODUCT_CATEGORIES = [
  'Dairy',
  'Bakery',
  'Grains',
  'Beverages',
  'Snacks',
  'Grocery',
  'Staples',
  'Personal Care',
  'Other'
];

export const PRODUCT_UNITS = [
  'units',
  'bottles',
  'bottles (1L)',
  'loaves',
  'cans',
  'packs',
  'jars',
  'boxes',
  'bags',
  'bags (1kg)',
  'bags (5kg)',
  'litres',
  'ml',
  'kg',
  'grams',
  'pieces'
];

export const STOCK_STATUS_CONFIG = {
  NORMAL: {
    label: 'NORMAL',
    color: 'emerald',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Current stock > Minimum stock'
  },
  LOW: {
    label: 'LOW',
    color: 'amber',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    description: 'Current stock <= Minimum stock and > 50% min'
  },
  CRITICAL: {
    label: 'CRITICAL',
    color: 'orange',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    description: 'Current stock <= 50% minimum stock and > 0'
  },
  OUT_OF_STOCK: {
    label: 'OUT OF STOCK',
    color: 'red',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    description: 'Current stock = 0'
  }
};
