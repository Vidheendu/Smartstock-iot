/**
 * SmartStock Frontend Restocking Service
 * 
 * Provides API client functions for Phase 11 Restocking & Purchase Order Management.
 * Uses the configured Axios instance.
 */

import api from '../api/axios.js';

/**
 * GET /api/restock
 * 
 * @param {Object} [filters={}] - Optional status, supplierId, search, dates, sorting
 */
export async function getRestockOrders(filters = {}) {
  const response = await api.get('/restock', { params: filters });
  return response.data;
}

/**
 * GET /api/restock/:id
 * 
 * @param {string} id - Restock order UUID or order number
 */
export async function getRestockOrder(id) {
  const response = await api.get(`/restock/${id}`);
  return response.data;
}

/**
 * GET /api/restock/summary
 * KPI summary metrics
 */
export async function getRestockSummary() {
  const response = await api.get('/restock/summary');
  return response.data;
}

/**
 * GET /api/restock/needing-restock
 * Products with low stock or low forecast runway
 */
export async function getProductsNeedingRestock() {
  const response = await api.get('/restock/needing-restock');
  return response.data;
}

/**
 * POST /api/restock
 * Create a new restock order (MANAGER only)
 * 
 * @param {Object} data - { supplierId, items: [{ productId, quantity, unitPrice? }], notes? }
 */
export async function createRestockOrder(data) {
  const response = await api.post('/restock', data);
  return response.data;
}

/**
 * PUT /api/restock/:id
 * Update a non-received restock order (MANAGER only)
 * 
 * @param {string} id 
 * @param {Object} data 
 */
export async function updateRestockOrder(id, data) {
  const response = await api.put(`/restock/${id}`, data);
  return response.data;
}

/**
 * PATCH /api/restock/:id/order
 * Mark order as ORDERED (transferred to supplier)
 * 
 * @param {string} id 
 */
export async function markRestockOrdered(id) {
  const response = await api.patch(`/restock/${id}/order`);
  return response.data;
}

/**
 * PATCH /api/restock/:id/receive
 * Mark order as RECEIVED and increase product inventory
 * 
 * @param {string} id 
 */
export async function receiveRestockOrder(id) {
  const response = await api.patch(`/restock/${id}/receive`);
  return response.data;
}

/**
 * PATCH /api/restock/:id/cancel
 * Cancel order before receipt
 * 
 * @param {string} id 
 * @param {string} [reason]
 */
export async function cancelRestockOrder(id, reason = '') {
  const response = await api.patch(`/restock/${id}/cancel`, { reason });
  return response.data;
}

export default {
  getRestockOrders,
  getRestockOrder,
  getRestockSummary,
  getProductsNeedingRestock,
  createRestockOrder,
  updateRestockOrder,
  markRestockOrdered,
  receiveRestockOrder,
  cancelRestockOrder
};
