/**
 * SmartStock Dashboard Service
 *
 * NOTE: Phase 3 uses temporary frontend mock data for dashboard statistics,
 * stock status overview, and recent activity.
 *
 * This service is designed to be cleanly replaced with live API calls
 * (e.g. GET /api/dashboard/stats) in Phase 4+ without frontend restructuring.
 */

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

// Temporary Phase 3 Mock Data Store
const MOCK_STATS = {
  totalProducts: 10,
  lowStock: 3,
  criticalStock: 1,
  outOfStock: 1
};

const MOCK_STOCK_STATUS = {
  normal: 5,
  low: 3,
  critical: 1,
  outOfStock: 1,
  total: 10
};

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
    description: 'Bread reached minimum stock level (Current: 4, Min: 5)',
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
 * Fetch top-level dashboard summary statistics.
 * @returns {Promise<{ success: boolean, data: DashboardStats }>}
 */
export const getDashboardStats = async () => {
  // Simulate network latency for realistic loading experience
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    data: { ...MOCK_STATS }
  };
};

/**
 * Fetch stock status breakdown based on SmartStock threshold criteria.
 * @returns {Promise<{ success: boolean, data: StockStatusSummary }>}
 */
export const getStockStatusSummary = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    data: { ...MOCK_STOCK_STATUS }
  };
};

/**
 * Fetch recent activity list for store stock updates.
 * @returns {Promise<{ success: boolean, data: RecentActivity[] }>}
 */
export const getRecentActivities = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));

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
