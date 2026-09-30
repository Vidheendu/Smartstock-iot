import * as notificationService from '../services/notification.service.js';

/**
 * Controller to fetch all notifications for the authenticated user.
 * GET /api/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let isRead;
    if (req.query.isRead !== undefined) {
      isRead = req.query.isRead === 'true';
    }

    if (req.query.type) {
      const allowedTypes = ['LOW_STOCK', 'CRITICAL_STOCK', 'OUT_OF_STOCK', 'SYSTEM', 'RESTOCK'];
      if (!allowedTypes.includes(req.query.type.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid notification type '${req.query.type}'. Allowed: ${allowedTypes.join(', ')}`
        });
      }
    }

    const rawLimit = parseInt(req.query.limit, 10);
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const rawOffset = parseInt(req.query.offset, 10);
    const offset = !isNaN(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

    const options = {
      isRead,
      type: req.query.type ? req.query.type.toUpperCase() : undefined,
      search: req.query.search ? String(req.query.search).trim().slice(0, 100) : undefined,
      limit,
      offset
    };

    const result = await notificationService.getUserNotifications(userId, options);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch unread notification count for the authenticated user.
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch a single notification by ID.
 * GET /api/notifications/:id
 */
export async function getNotificationById(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const notification = await notificationService.getNotificationById(id, userId);

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }
    next(error);
  }
}

/**
 * Controller to mark a notification as read.
 * PATCH /api/notifications/:id/read
 */
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const updated = await notificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }
    next(error);
  }
}

/**
 * Controller to mark a notification as unread.
 * PATCH /api/notifications/:id/unread
 */
export async function markAsUnread(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const updated = await notificationService.markAsUnread(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as unread',
      data: updated
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }
    next(error);
  }
}

/**
 * Controller to mark all notifications as read for the authenticated user.
 * PATCH /api/notifications/read-all
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to delete a notification.
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }
    next(error);
  }
}

export default {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification
};
