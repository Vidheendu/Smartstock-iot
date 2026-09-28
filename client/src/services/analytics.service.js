/**
 * SmartStock Frontend Analytics Service
 * 
 * Provides API client calls for Phase 9 Analytics & Inventory Insights.
 * Uses the existing Axios instance with auth interceptors.
 */

import api from '../api/axios.js';

/**
 * GET /api/analytics/overview?range=30d
 */
export async function getOverview(range = '30d') {
  const response = await api.get('/analytics/overview', {
    params: { range }
  });
  return response.data;
}

/**
 * GET /api/analytics/inventory-movement?range=30d
 */
export async function getInventoryMovement(range = '30d') {
  const response = await api.get('/analytics/inventory-movement', {
    params: { range }
  });
  return response.data;
}

/**
 * GET /api/analytics/categories
 */
export async function getCategoryAnalytics() {
  const response = await api.get('/analytics/categories');
  return response.data;
}

/**
 * GET /api/analytics/products
 */
export async function getProductAnalytics() {
  const response = await api.get('/analytics/products');
  return response.data;
}

/**
 * GET /api/analytics/alerts?range=30d
 */
export async function getAlertAnalytics(range = '30d') {
  const response = await api.get('/analytics/alerts', {
    params: { range }
  });
  return response.data;
}

/**
 * GET /api/analytics/iot?range=30d
 */
export async function getIoTAnalytics(range = '30d') {
  const response = await api.get('/analytics/iot', {
    params: { range }
  });
  return response.data;
}

export default {
  getOverview,
  getInventoryMovement,
  getCategoryAnalytics,
  getProductAnalytics,
  getAlertAnalytics,
  getIoTAnalytics
};
