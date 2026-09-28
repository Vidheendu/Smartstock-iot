/**
 * SmartStock Frontend Forecast Service
 * 
 * Provides API client calls for Phase 10 Stock Forecasting & Demand Insights.
 * Uses the configured Axios instance.
 */

import api from '../api/axios.js';

/**
 * GET /api/forecast/overview?period=30
 * 
 * @param {number} [period=30] - 7, 30, or 90
 */
export async function getForecastOverview(period = 30) {
  const response = await api.get('/forecast/overview', {
    params: { period }
  });
  return response.data;
}

/**
 * GET /api/forecast/products/:productId?period=30
 * 
 * @param {string} productId 
 * @param {number} [period=30]
 */
export async function getProductForecast(productId, period = 30) {
  const response = await api.get(`/forecast/products/${productId}`, {
    params: { period }
  });
  return response.data;
}

/**
 * GET /api/forecast/products/:productId/consumption?period=30
 * 
 * @param {string} productId 
 * @param {number} [period=30]
 */
export async function getProductConsumption(productId, period = 30) {
  const response = await api.get(`/forecast/products/${productId}/consumption`, {
    params: { period }
  });
  return response.data;
}

export default {
  getForecastOverview,
  getProductForecast,
  getProductConsumption
};
