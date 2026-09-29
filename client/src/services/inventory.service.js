import api from '../api/axios.js';

/**
 * Fetch current inventory levels for all products with optional filters.
 * 
 * @param {Object} [params] - { search, category, status }
 * @returns {Promise<Array>} List of inventory items
 */
export const getInventory = async (params = {}) => {
  const response = await api.get('/inventory', { params });
  return response.data?.data || [];
};

/**
 * Fetch inventory details for a specific product by ID.
 * 
 * @param {string} productId - Product UUID
 * @returns {Promise<Object>} Inventory details
 */
export const getInventoryByProduct = async (productId) => {
  const response = await api.get(`/inventory/${productId}`);
  return response.data?.data;
};

/**
 * Record a Stock In transaction.
 * 
 * @param {string} productId - Product UUID
 * @param {number} quantity - Quantity received (must be > 0)
 * @param {string} reason - Justification for stock-in
 * @returns {Promise<Object>} Updated inventory & transaction log
 */
export const stockIn = async (productId, quantity, reason) => {
  const response = await api.post('/inventory/stock-in', {
    productId,
    quantity,
    reason
  });
  return response.data?.data;
};

/**
 * Record a Stock Out transaction.
 * 
 * @param {string} productId - Product UUID
 * @param {number} quantity - Quantity deducted (must be > 0 and <= currentStock)
 * @param {string} reason - Justification for stock-out
 * @returns {Promise<Object>} Updated inventory & transaction log
 */
export const stockOut = async (productId, quantity, reason) => {
  const response = await api.post('/inventory/stock-out', {
    productId,
    quantity,
    reason
  });
  return response.data?.data;
};

/**
 * Record a Stock Adjustment transaction (MANAGER only).
 * 
 * @param {string} productId - Product UUID
 * @param {number} newStock - New physical stock level (>= 0)
 * @param {string} reason - Justification for adjustment
 * @returns {Promise<Object>} Updated inventory & transaction log
 */
export const adjustStock = async (productId, newStock, reason) => {
  const response = await api.post('/inventory/adjust', {
    productId,
    newStock,
    reason
  });
  return response.data?.data;
};

/**
 * Fetch inventory audit history with optional filters.
 * 
 * @param {Object} [params] - { productId, changeType, source }
 * @returns {Promise<Array>} Inventory history records
 */
export const getInventoryHistory = async (params = {}) => {
  const response = await api.get('/inventory/history', { params });
  return response.data?.data || [];
};

/**
 * Fetch inventory audit history for a single product with optional filters and pagination.
 * 
 * @param {string} productId - Product UUID
 * @param {Object} [params] - { changeType, source, dateFilter, page, limit }
 * @returns {Promise<Array>} Product-specific inventory history records (with pagination metadata)
 */
export const getProductHistory = async (productId, params = {}) => {
  const response = await api.get(`/inventory/${productId}/history`, { params });
  const data = response.data?.data || [];
  if (Array.isArray(data)) {
    data.total = response.data?.total ?? data.length;
    data.page = response.data?.page ?? 1;
    data.limit = response.data?.limit ?? data.length;
    data.totalPages = response.data?.totalPages ?? 1;
  }
  return data;
};

export default {
  getInventory,
  getInventoryByProduct,
  stockIn,
  stockOut,
  adjustStock,
  getInventoryHistory,
  getProductHistory
};
