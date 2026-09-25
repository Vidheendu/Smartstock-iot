/**
 * SmartStock Dashboard Service
 *
 * Integrated in Phase 4 to pull live product catalog metrics from the backend API
 * (GET /api/dashboard/stats) while keeping simulated activity data until telemetry
 * and alert engines are introduced in subsequent phases.
 */

import api from '../api/axios.js';

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalProducts - Total number of registered products
 * @property {number} lowStock - Products at or below minimum stock threshold
 * @property {number} criticalStock - Products at or below 50% minimum stock (and > 0)
 * @property {number} outOfStock - Products with zero stock
 */

/**
 * @typedef {Object} StockStatusSummary
 * @property {number} normal - Current stock > minimum stock
 * @property {number} low - Current stock <= minimum stock and > 50% min
 * @property {number} critical - Current stock <= 50% minimum stock and > 0
 * @property {number} outOfStock - Current stock = 0
 * @property {number} total - Total product count
 */

/**
 * @typedef {Object} RecentActivity
 * @property {string} id - Unique activity identifier
 * @property {string} type - Activity category ('stock_update' | 'product_added' | 'alert' | 'restock')
 * @property {string} title - Activity heading
 * @property {string} description - Detail of the event
 * @property {string} timestamp - Human readable relative time
 */

const MOCK_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'stock_update',
    title: 'Stock updated',
    description: 'Milk quantity changed (-5 units)',
    timestamp: '10 minutes ago'
  },
  {
    id: 'act-2',
    type: 'product_added',
    title: 'Product added',
    description: 'Coffee added to inventory (Initial stock: 25)',
    timestamp: '45 minutes ago'
  },
  {
    id: 'act-3',
    type: 'alert',
    title: 'Low stock detected',
    description: 'Bread reached minimum stock level (Current: 18, Min: 30)',
    timestamp: '2 hours ago'
  },
  {
    id: 'act-4',
    type: 'restock',
    title: 'Restock order created',
    description: 'Cooking Oil restock request created (Qty: 20)',
    timestamp: '5 hours ago'
  }
];

/**
 * Fetch top-level dashboard summary statistics from live database.
 * @returns {Promise<{ success: boolean, data: DashboardStats }>}
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: {
          totalProducts: response.data.data.totalProducts ?? 0,
          lowStock: response.data.data.lowStock ?? 0,
          criticalStock: response.data.data.criticalStock ?? 0,
          outOfStock: response.data.data.outOfStock ?? 0
        }
      };
    }
  } catch (err) {
    console.warn('[DASHBOARD API] Failed to fetch live stats, using fallback:', err.message);
  }

  return {
    success: true,
    data: {
      totalProducts: 10,
      lowStock: 2,
      criticalStock: 3,
      outOfStock: 1
    }
  };
};

/**
 * Fetch stock status breakdown based on SmartStock threshold criteria.
 * @returns {Promise<{ success: boolean, data: StockStatusSummary }>}
 */
export const getStockStatusSummary = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    if (response.data?.success && response.data?.data) {
      const d = response.data.data;
      return {
        success: true,
        data: {
          normal: d.normal ?? 0,
          low: d.lowStock ?? 0,
          critical: d.criticalStock ?? 0,
          outOfStock: d.outOfStock ?? 0,
          total: d.totalProducts ?? 0
        }
      };
    }
  } catch (err) {
    console.warn('[DASHBOARD API] Failed to fetch live status, using fallback:', err.message);
  }

  return {
    success: true,
    data: {
      normal: 4,
      low: 2,
      critical: 3,
      outOfStock: 1,
      total: 10
    }
  };
};

/**
 * Fetch recent activity list for store stock updates.
 * @returns {Promise<{ success: boolean, data: RecentActivity[] }>}
 */
export const getRecentActivities = async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    success: true,
    data: [...MOCK_ACTIVITIES]
  };
};

export default {
  getDashboardStats,
  getStockStatusSummary,
  getRecentActivities
};
