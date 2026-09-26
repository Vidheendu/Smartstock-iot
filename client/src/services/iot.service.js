import api from '../api/axios.js';

/**
 * Fetch all registered simulated IoT devices.
 * 
 * @returns {Promise<Array>} List of simulated devices
 */
export const getDevices = async () => {
  const response = await api.get('/iot/devices');
  return response.data?.data || [];
};

/**
 * Send software-simulated sensor reading from a device.
 * 
 * @param {Object} payload - { deviceId, calculatedUnits, rawReading, batteryLevel }
 * @returns {Promise<Object>} Telemetry result, updated product, and alert action
 */
export const sendTelemetry = async (payload) => {
  const response = await api.post('/iot/simulate', payload);
  return response.data;
};

export default {
  getDevices,
  sendTelemetry
};
