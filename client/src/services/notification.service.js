import api from '../api/axios.js';

/**
 * Fetch notifications for authenticated user with optional filtering/pagination.
 * 
 * @param {Object} [params] - { isRead, type, search, limit, offset }
 * @returns {Promise<Object>} { data: Array, pagination: Object }
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data || { success: true, data: [], pagination: {} };
};

/**
 * Fetch unread notification count for authenticated user.
 * 
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data?.count ?? 0;
};

/**
 * Fetch single notification by ID.
 * 
 * @param {string} id - Notification UUID
 * @returns {Promise<Object>} Notification details
 */
export const getNotification = async (id) => {
  const response = await api.get(`/notifications/${id}`);
  return response.data?.data;
};

/**
 * Mark a single notification as read.
 * 
 * @param {string} id - Notification UUID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data?.data;
};

/**
 * Mark a single notification as unread.
 * 
 * @param {string} id - Notification UUID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsUnread = async (id) => {
  const response = await api.patch(`/notifications/${id}/unread`);
  return response.data?.data;
};

/**
 * Mark all notifications for authenticated user as read.
 * 
 * @returns {Promise<Object>} Result message
 */
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

/**
 * Delete a notification.
 * 
 * @param {string} id - Notification UUID
 * @returns {Promise<Object>} Result message
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export default {
  getNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification
};
