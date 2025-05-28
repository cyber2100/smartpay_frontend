import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from './use-websocket';
import { notificationService } from '@/services/api';

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'system';
  read: boolean;
  timestamp: Date;
  metadata?: {
    transactionId?: string;
    amount?: number;
  };
}

export type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isWebSocketConnected: boolean;
  getNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
};

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // WebSocket event handlers
  const handleUnreadCountUpdate = useCallback((count: number) => {
    console.log('WebSocket: Unread count updated to:', count);
    setUnreadCount(count);
  }, []);

  const handleNewNotification = useCallback((notification: any) => {
    console.log('WebSocket: New notification received:', notification);
    const transformedNotification = transformNotification(notification);
    
    setNotifications(prev => [transformedNotification, ...prev]);
    
    // Show toast for new notification
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
  }, [toast]);

  const handleNotificationRead = useCallback((notificationId: string) => {
    console.log('WebSocket: Notification marked as read:', notificationId);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Initialize WebSocket
  const { isConnected: isWebSocketConnected } = useWebSocket({
    onUnreadCountUpdate: handleUnreadCountUpdate,
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
  });

  // Load notifications when user changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('notification page come');
      getNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

  }, [isAuthenticated]);

  // Transform API notifications to our app format
  const transformNotification = (apiNotification: any): Notification => ({
    id: apiNotification.id,
    type: apiNotification.type,
    title: apiNotification.title,
    message: apiNotification.message,
    metadata: {
      transactionId: apiNotification.extra_data?.transactionId,
      amount: apiNotification.extra_data?.amount,
    },
    timestamp: new Date(apiNotification.timestamp),
    read: apiNotification.read
  });

  // Get all notifications
  const getNotifications = async (): Promise<void> => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      const formattedNotifications = response.map(transformNotification);
      setNotifications(formattedNotifications);
      
      // Calculate unread count from fetched notifications
      const unreadFromAPI = formattedNotifications.filter(notif => !notif.read).length;
      setUnreadCount(unreadFromAPI);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count locally (WebSocket will also update it)
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      await notificationService.markAllAsRead();
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    // Check if the notification being deleted is unread
    const notificationToDelete = notifications.find(notif => notif.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read;
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
      // Update unread count if deleted notification was unread
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: "Success",
        description: "Notification deleted"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
      return false;
    }
  };

  // Refresh notifications (alias for getNotifications)
  const refreshNotifications = async (): Promise<void> => {
    await getNotifications();
  };

  console.log('unreadcount = ', unreadCount);
  console.log('WebSocket connected:', isWebSocketConnected);

  // Value to provide
  const value: NotificationContextType = {
    notifications,
    unreadCount, // This will be updated in real-time via WebSocket
    loading,
    isWebSocketConnected,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};