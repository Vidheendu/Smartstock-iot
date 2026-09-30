import api from '../api/axios.js';

/**
 * Fetch notification preferences for authenticated user.
 */
export const getPreferences = async () => {
  const response = await api.get('/settings/preferences');
  return response.data;
};

/**
 * Update notification preferences for authenticated user.
 * 
 * @param {object} preferences - { low_stock_enabled, critical_stock_enabled, out_of_stock_enabled, system_notifications_enabled }
 */
export const updatePreferences = async (preferences) => {
  const response = await api.put('/settings/preferences', preferences);
  return response.data;
};

export default {
  getPreferences,
  updatePreferences
};
