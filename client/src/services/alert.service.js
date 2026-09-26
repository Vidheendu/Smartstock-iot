import api from '../api/axios.js';

/**
 * Fetch all alerts with optional query filters.
 * 
 * @param {Object} [params] - { severity, status, source, productId, search }
 * @returns {Promise<Array>} List of alerts
 */
export const getAlerts = async (params = {}) => {
  const response = await api.get('/alerts', { params });
  return response.data?.data || [];
};

/**
 * Fetch active alert summary counts.
 * 
 * @returns {Promise<Object>} { activeAlerts, criticalAlerts, lowStockAlerts, outOfStockAlerts }
 */
export const getAlertSummary = async () => {
  const response = await api.get('/alerts/summary');
  return response.data?.data || {
    activeAlerts: 0,
    criticalAlerts: 0,
    lowStockAlerts: 0,
    outOfStockAlerts: 0
  };
};

/**
 * Fetch a single alert by ID.
 * 
 * @param {string} id - Alert UUID
 * @returns {Promise<Object>} Alert details
 */
export const getAlert = async (id) => {
  const response = await api.get(`/alerts/${id}`);
  return response.data?.data;
};

/**
 * Acknowledge an alert.
 * 
 * @param {string} id - Alert UUID
 * @returns {Promise<Object>} Updated alert
 */
export const acknowledgeAlert = async (id) => {
  const response = await api.patch(`/alerts/${id}/acknowledge`);
  return response.data?.data;
};

/**
 * Resolve an alert manually.
 * 
 * @param {string} id - Alert UUID
 * @returns {Promise<Object>} Updated alert
 */
export const resolveAlert = async (id) => {
  const response = await api.patch(`/alerts/${id}/resolve`);
  return response.data?.data;
};

export default {
  getAlerts,
  getAlertSummary,
  getAlert,
  acknowledgeAlert,
  resolveAlert
};
