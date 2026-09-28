/**
 * Notification Type Definitions
 * Phase 8: Notifications & Notification Center
 *
 * @typedef {'LOW_STOCK' | 'CRITICAL_STOCK' | 'OUT_OF_STOCK' | 'SYSTEM'} NotificationType
 * 
 * @typedef {'UNREAD' | 'READ'} NotificationState
 *
 * @typedef {Object} Notification
 * @property {string} id - Unique UUID
 * @property {string} userId - Target recipient user UUID
 * @property {string|null} [alertId] - Associated alert UUID
 * @property {string|null} [productId] - Associated product UUID
 * @property {string} [productName] - Product display name
 * @property {NotificationType} type - Notification category type
 * @property {string} title - Standardized alert title
 * @property {string} message - User-facing notification message
 * @property {boolean} isRead - Whether notification has been read
 * @property {string|null} [readAt] - Timestamp when marked as read
 * @property {string} createdAt - Creation timestamp (ISO string)
 */

export const NOTIFICATION_TYPES = Object.freeze({
  LOW_STOCK: 'LOW_STOCK',
  CRITICAL_STOCK: 'CRITICAL_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  SYSTEM: 'SYSTEM'
});

export const NOTIFICATION_TITLES = Object.freeze({
  LOW_STOCK: 'Low Stock Alert',
  CRITICAL_STOCK: 'Critical Stock Alert',
  OUT_OF_STOCK: 'Out of Stock Alert',
  SYSTEM: 'SmartStock Notification'
});
