import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as notificationService from '../services/notification.service.js';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pollingTimerRef = useRef(null);

  // Refresh both recent notifications and unread count
  const refresh = useCallback(async (options = { silent: false }) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!options.silent) {
      setLoading(true);
    }

    try {
      setError(null);
      const [notifsRes, count] = await Promise.all([
        notificationService.getNotifications({ limit: 20 }),
        notificationService.getUnreadCount()
      ]);

      if (notifsRes && Array.isArray(notifsRes.data)) {
        setNotifications(notifsRes.data);
      }
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (err) {
      console.warn('[NOTIFICATIONS] Fetch failed:', err.response?.data?.message || err.message);
      if (!options.silent) {
        setError('Unable to load notifications.');
      }
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  // Fetch unread count lightweight check
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Ignore background polling errors
    }
  }, [isAuthenticated]);

  // Initialize and setup polling (every 20 seconds)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return;
    }

    // Initial load
    refresh();

    // Start single polling interval for notifications
    pollingTimerRef.current = setInterval(() => {
      refresh({ silent: true });
    }, 20000);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, refresh]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const updated = await notificationService.markAsRead(id);
      return updated;
    } catch (err) {
      console.warn('[NOTIFICATIONS] Mark as read failed, reverting:', err.message);
      refresh({ silent: true });
      throw err;
    }
  };

  // Mark single notification as unread
  const markAsUnread = async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false, readAt: null } : n))
    );
    setUnreadCount((prev) => prev + 1);

    try {
      const updated = await notificationService.markAsUnread(id);
      return updated;
    } catch (err) {
      console.warn('[NOTIFICATIONS] Mark as unread failed, reverting:', err.message);
      refresh({ silent: true });
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Optimistic update
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: now }))
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.warn('[NOTIFICATIONS] Mark all read failed, reverting:', err.message);
      refresh({ silent: true });
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    // Check if was unread
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.isRead;

    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.warn('[NOTIFICATIONS] Delete failed, reverting:', err.message);
      refresh({ silent: true });
      throw err;
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    fetchUnreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
