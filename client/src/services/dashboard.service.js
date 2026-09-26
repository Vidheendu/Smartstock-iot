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
          outOfStock: response.data.data.outOfStock ?? 0,
          activeAlerts: response.data.data.activeAlerts ?? 0
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
      outOfStock: 1,
      activeAlerts: 6
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

import inventoryService from './inventory.service.js';

function formatRelativeTime(dateString) {
  const delta = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (delta < 60) return 'Just now';
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

/**
 * Fetch recent activity list from live inventory history records.
 * @returns {Promise<{ success: boolean, data: RecentActivity[] }>}
 */
export const getRecentActivities = async () => {
  try {
    const history = await inventoryService.getInventoryHistory();
    if (history && history.length > 0) {
      const activities = history.slice(0, 5).map((h) => {
        const isPositive = Number(h.quantityChange) > 0;
        return {
          id: h.id,
          type: h.changeType === 'STOCK_IN' ? 'stock_in' : h.changeType === 'STOCK_OUT' ? 'stock_out' : 'adjustment',
          title:
            h.changeType === 'STOCK_IN'
              ? `Stock Received: ${h.productName}`
              : h.changeType === 'STOCK_OUT'
              ? `Stock Sold / Out: ${h.productName}`
              : `Stock Adjusted: ${h.productName}`,
          description: `${isPositive ? `+${h.quantityChange}` : h.quantityChange} ${h.unit} (${h.previousStock} → ${h.newStock}) — ${h.reason}`,
          timestamp: formatRelativeTime(h.createdAt)
        };
      });

      return {
        success: true,
        data: activities
      };
    }
  } catch (err) {
    console.warn('[DASHBOARD ACTIVITIES] Using mock fallback:', err.message);
  }

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

