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
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Current stock > Minimum stock'
  },
  LOW: {
    label: 'LOW',
    color: 'amber',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Current stock <= Minimum stock and > 50% min'
  },
  CRITICAL: {
    label: 'CRITICAL',
    color: 'orange',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'Current stock <= 50% minimum stock and > 0'
  },
  OUT_OF_STOCK: {
    label: 'OUT OF STOCK',
    color: 'red',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'Current stock = 0'
  }
};
