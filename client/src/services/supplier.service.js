/**
 * SmartStock Frontend Supplier Service (Phase 12)
 * 
 * Provides API client functions for Supplier Management module.
 * Uses the pre-configured Axios instance with authorization headers.
 */

import api from '../api/axios.js';

/**
 * GET /api/suppliers
 * List suppliers with search, status filtering, hasActiveOrders, sorting, and pagination.
 * 
 * @param {Object} [params={}] - { search, status, hasActiveOrders, sort, order, page, limit, activeOnly }
 * @returns {Promise<Object>} { success, data, pagination, summary, count }
 */
export async function getSuppliers(params = {}) {
  const response = await api.get('/suppliers', { params });
  return response.data;
}

/**
 * GET /api/suppliers/:id
 * Retrieve single supplier details by ID.
 * 
 * @param {string} id - Supplier UUID
 * @returns {Promise<Object>} { success, data, supplier }
 */
export async function getSupplier(id) {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
}

/**
 * POST /api/suppliers
 * Create a new supplier (MANAGER only).
 * 
 * @param {Object} data - { name, contact_person, email, phone, address, city, state, country, postal_code, notes, lead_time_days }
 * @returns {Promise<Object>} { success, message, data, supplier }
 */
export async function createSupplier(data) {
  const response = await api.post('/suppliers', data);
  return response.data;
}

/**
 * PUT /api/suppliers/:id
 * Update an existing supplier (MANAGER only).
 * 
 * @param {string} id - Supplier UUID
 * @param {Object} data - Updated supplier fields
 * @returns {Promise<Object>} { success, message, data, supplier }
 */
export async function updateSupplier(id, data) {
  const response = await api.put(`/suppliers/${id}`, data);
  return response.data;
}

/**
 * PATCH /api/suppliers/:id/status
 * Activate or deactivate a supplier (MANAGER only). Soft deactivation.
 * 
 * @param {string} id - Supplier UUID
 * @param {boolean} isActive - Desired status
 * @returns {Promise<Object>} { success, message, data, supplier }
 */
export async function updateSupplierStatus(id, isActive) {
  const response = await api.patch(`/suppliers/${id}/status`, { is_active: Boolean(isActive) });
  return response.data;
}

/**
 * GET /api/suppliers/:id/products
 * Fetch products associated with a specific supplier.
 * 
 * @param {string} id - Supplier UUID
 * @returns {Promise<Object>} { success, count, products, data }
 */
export async function getSupplierProducts(id) {
  const response = await api.get(`/suppliers/${id}/products`);
  return response.data;
}

/**
 * GET /api/suppliers/:id/restock-orders
 * Fetch restock orders associated with a specific supplier.
 * 
 * @param {string} id - Supplier UUID
 * @returns {Promise<Object>} { success, count, orders, data }
 */
export async function getSupplierRestockOrders(id) {
  const response = await api.get(`/suppliers/${id}/restock-orders`);
  return response.data;
}

export default {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  getSupplierProducts,
  getSupplierRestockOrders
};
