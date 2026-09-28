import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// 1. List user notifications with filtering & pagination
router.get('/', notificationController.getNotifications);

// 2. Unread notification count for authenticated user
router.get('/unread-count', notificationController.getUnreadCount);

// 3. Mark all notifications as read for authenticated user
router.patch('/read-all', notificationController.markAllAsRead);

// 4. Single notification details
router.get('/:id', notificationController.getNotificationById);

// 5. Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// 6. Mark notification as unread
router.patch('/:id/unread', notificationController.markAsUnread);

// 7. Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
