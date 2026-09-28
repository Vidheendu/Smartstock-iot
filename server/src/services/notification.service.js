import crypto from 'crypto';
import supabase from '../config/db.js';
import { getAllUsers } from './auth.service.js';
import { getProductById } from './product.service.js';
import { NOTIFICATION_TYPES, NOTIFICATION_TITLES } from '../types/notification.types.js';

export { NOTIFICATION_TYPES, NOTIFICATION_TITLES };

/**
 * Standard notification title resolver
 */
export function getNotificationTitle(type) {
  return NOTIFICATION_TITLES[type] || 'SmartStock Notification';
}

/**
 * Map alert types to notification types
 */
export function mapAlertToNotificationType(alertType) {
  switch (alertType) {
    case 'LOW_STOCK':
      return NOTIFICATION_TYPES.LOW_STOCK;
    case 'CRITICAL_STOCK':
      return NOTIFICATION_TYPES.CRITICAL_STOCK;
    case 'OUT_OF_STOCK':
      return NOTIFICATION_TYPES.OUT_OF_STOCK;
    default:
      return NOTIFICATION_TYPES.SYSTEM;
  }
}

/**
 * Seed notifications for in-memory fallback (mirrors database/seeds.sql)
 */
const initialSeedNotifications = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    user_id: 'e0000000-0000-0000-0000-000000000001', // Manager
    alert_id: 'd0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000005', // Coca Cola
    title: 'Out of Stock Alert',
    message: 'Coca Cola is out of stock.',
    type: 'OUT_OF_STOCK',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    user_id: 'e0000000-0000-0000-0000-000000000001', // Manager
    alert_id: 'd0000000-0000-0000-0000-000000000002',
    product_id: 'b0000000-0000-0000-0000-000000000004', // Sugar
    title: 'Critical Stock Alert',
    message: 'Sugar stock is critical. Current stock is 12 bags (1kg) and minimum stock is 40 bags (1kg).',
    type: 'CRITICAL_STOCK',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    user_id: 'e0000000-0000-0000-0000-000000000001', // Manager
    alert_id: 'd0000000-0000-0000-0000-000000000003',
    product_id: 'b0000000-0000-0000-0000-000000000007', // Cooking Oil
    title: 'Critical Stock Alert',
    message: 'Cooking Oil stock is critical. Current stock is 8 bottles (1L) and minimum stock is 30 bottles (1L).',
    type: 'CRITICAL_STOCK',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    user_id: 'e0000000-0000-0000-0000-000000000002', // Staff
    alert_id: 'd0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000005',
    title: 'Out of Stock Alert',
    message: 'Coca Cola is out of stock.',
    type: 'OUT_OF_STOCK',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    user_id: 'e0000000-0000-0000-0000-000000000002', // Staff
    alert_id: 'd0000000-0000-0000-0000-000000000002',
    product_id: 'b0000000-0000-0000-0000-000000000004',
    title: 'Critical Stock Alert',
    message: 'Sugar stock is critical. Current stock is 12 bags (1kg) and minimum stock is 40 bags (1kg).',
    type: 'CRITICAL_STOCK',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 60 * 60000).toISOString()
  }
];

let inMemoryNotifications = JSON.parse(JSON.stringify(initialSeedNotifications));

/**
 * Reset in-memory notifications for test isolation
 */
export function _resetInMemoryNotifications() {
  inMemoryNotifications = JSON.parse(JSON.stringify(initialSeedNotifications));
}

/**
 * Enriches a notification record with formatted fields and product details
 */
export async function enrichNotification(record) {
  let productName = 'Unknown Product';
  const productId = record.product_id || record.productId;

  if (productId) {
    try {
      const prod = await getProductById(productId);
      if (prod) {
        productName = prod.name;
      }
    } catch {
      // Ignore lookup failure
    }
  }

  return {
    id: record.id,
    userId: record.user_id || record.userId,
    alertId: record.alert_id || record.alertId || null,
    productId: productId || null,
    productName,
    type: record.type,
    title: record.title,
    message: record.message,
    isRead: Boolean(record.is_read ?? record.isRead),
    readAt: record.read_at || record.readAt || null,
    createdAt: record.created_at || record.createdAt
  };
}

/**
 * Creates a single notification record with duplicate prevention.
 */
export async function createNotification({
  userId,
  alertId = null,
  productId = null,
  type = NOTIFICATION_TYPES.SYSTEM,
  title,
  message
}) {
  if (!userId) {
    throw new Error('User ID is required to create a notification');
  }

  const notificationTitle = title || getNotificationTitle(type);
  const now = new Date().toISOString();

  // 1. Service-level Duplicate Check (alert_id + user_id)
  if (alertId) {
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('alert_id', alertId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          // Already exists in DB
          return getNotificationById(existing.id, userId);
        }
      } catch (err) {
        console.warn('[NOTIFICATION SERVICE] Supabase check duplicate warning:', err.message);
      }
    }

    const existingInMemory = inMemoryNotifications.find(
      (n) => (n.alert_id === alertId || n.alertId === alertId) && (n.user_id === userId || n.userId === userId)
    );

    if (existingInMemory) {
      return enrichNotification(existingInMemory);
    }
  }

  const newRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    alert_id: alertId,
    product_id: productId,
    title: notificationTitle,
    message: message || 'Inventory alert notification',
    type,
    is_read: false,
    read_at: null,
    created_at: now
  };

  // Insert into Supabase if available
  if (supabase) {
    try {
      const { error } = await supabase.from('notifications').insert(newRecord);
      if (error) {
        console.warn('[NOTIFICATION SERVICE] Supabase insert warning:', error.message);
      }
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase insert exception:', err.message);
    }
  }

  inMemoryNotifications.unshift(newRecord);
  return enrichNotification(newRecord);
}

/**
 * Creates notifications for all eligible active users when a NEW alert is generated.
 * Integrates directly with Phase 7 Alert Engine.
 */
export async function createNotificationsForAlert(alert) {
  if (!alert) return [];

  const alertId = alert.id;
  const productId = alert.product_id || alert.productId;
  const alertType = alert.alert_type || alert.alertType;
  const notifType = mapAlertToNotificationType(alertType);
  const title = getNotificationTitle(notifType);
  const message = alert.message;

  // Retrieve active users from auth repository
  const users = await getAllUsers();
  const createdNotifications = [];

  for (const user of users) {
    try {
      const notif = await createNotification({
        userId: user.id,
        alertId,
        productId,
        type: notifType,
        title,
        message
      });
      if (notif) {
        createdNotifications.push(notif);
      }
    } catch (err) {
      console.warn(`[NOTIFICATION SERVICE] Failed creating notification for user ${user.id}:`, err.message);
    }
  }

  return createdNotifications;
}

/**
 * Retrieves notifications belonging to the authenticated user.
 * Supports filters: { isRead, type, search, limit = 20, offset = 0 }
 * Default order: newest first.
 */
export async function getUserNotifications(userId, options = {}) {
  const { isRead, type, search, limit = 20, offset = 0 } = options;

  let records = [];

  if (supabase) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (typeof isRead === 'boolean') {
        query = query.eq('is_read', isRead);
      }
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (!error && data) {
        records = data;
      }
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase query notifications warning:', err.message);
    }
  }

  // Fallback / merge with inMemoryNotifications
  if (records.length === 0) {
    records = inMemoryNotifications.filter(
      (n) => (n.user_id === userId || n.userId === userId)
    );
  }

  // Apply filters in memory
  let filtered = records;

  if (typeof isRead === 'boolean') {
    filtered = filtered.filter((n) => Boolean(n.is_read ?? n.isRead) === isRead);
  }

  if (type) {
    filtered = filtered.filter((n) => n.type === type);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

  // Enrich records first so search can check productName
  const enriched = await Promise.all(filtered.map(enrichNotification));

  // Search filter
  let searched = enriched;
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    searched = enriched.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (n.productName && n.productName.toLowerCase().includes(q))
    );
  }

  const total = searched.length;
  const paginated = searched.slice(Number(offset), Number(offset) + Number(limit));

  return {
    data: paginated,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset)
    }
  };
}

/**
 * Retrieves unread notification count for authenticated user.
 */
export async function getUnreadCount(userId) {
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (!error && typeof count === 'number') {
        return count;
      }
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase getUnreadCount warning:', err.message);
    }
  }

  const unread = inMemoryNotifications.filter(
    (n) => (n.user_id === userId || n.userId === userId) && !Boolean(n.is_read ?? n.isRead)
  );

  return unread.length;
}

/**
 * Retrieves a single notification by ID, ensuring user ownership.
 */
export async function getNotificationById(id, userId) {
  let record = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        record = data;
      }
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase getNotificationById warning:', err.message);
    }
  }

  if (!record) {
    record = inMemoryNotifications.find((n) => n.id === id);
  }

  if (!record) {
    const err = new Error('Notification not found.');
    err.status = 404;
    throw err;
  }

  // Security check: Must belong to requesting user
  const ownerId = record.user_id || record.userId;
  if (ownerId !== userId) {
    const err = new Error('Notification not found.');
    err.status = 404; // Return 404 to avoid leaking existence
    throw err;
  }

  return enrichNotification(record);
}

/**
 * Marks a notification as read.
 */
export async function markAsRead(id, userId) {
  const existing = await getNotificationById(id, userId);
  const now = new Date().toISOString();

  if (supabase) {
    try {
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: now
        })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase markAsRead warning:', err.message);
    }
  }

  // Update in memory
  const memoryRecord = inMemoryNotifications.find((n) => n.id === id);
  if (memoryRecord) {
    memoryRecord.is_read = true;
    memoryRecord.read_at = now;
  }

  return {
    ...existing,
    isRead: true,
    readAt: now
  };
}

/**
 * Marks a notification as unread.
 */
export async function markAsUnread(id, userId) {
  const existing = await getNotificationById(id, userId);

  if (supabase) {
    try {
      await supabase
        .from('notifications')
        .update({
          is_read: false,
          read_at: null
        })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase markAsUnread warning:', err.message);
    }
  }

  // Update in memory
  const memoryRecord = inMemoryNotifications.find((n) => n.id === id);
  if (memoryRecord) {
    memoryRecord.is_read = false;
    memoryRecord.read_at = null;
  }

  return {
    ...existing,
    isRead: false,
    readAt: null
  };
}

/**
 * Marks all notifications belonging to the authenticated user as read.
 */
export async function markAllAsRead(userId) {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: now
        })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase markAllAsRead warning:', err.message);
    }
  }

  // Update in memory for this user
  let updatedCount = 0;
  for (const n of inMemoryNotifications) {
    if ((n.user_id === userId || n.userId === userId) && !Boolean(n.is_read ?? n.isRead)) {
      n.is_read = true;
      n.read_at = now;
      updatedCount++;
    }
  }

  return {
    success: true,
    count: updatedCount
  };
}

/**
 * Deletes a notification belonging to the authenticated user.
 * Does NOT delete the alert, resolve the alert, or modify inventory.
 */
export async function deleteNotification(id, userId) {
  // Ensure notification exists and user owns it
  await getNotificationById(id, userId);

  if (supabase) {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Supabase deleteNotification warning:', err.message);
    }
  }

  const initialLen = inMemoryNotifications.length;
  inMemoryNotifications = inMemoryNotifications.filter(
    (n) => !(n.id === id && (n.user_id === userId || n.userId === userId))
  );

  return { success: true };
}

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_TITLES,
  getNotificationTitle,
  mapAlertToNotificationType,
  createNotification,
  createNotificationsForAlert,
  getUserNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  _resetInMemoryNotifications
};
