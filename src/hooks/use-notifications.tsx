import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from './use-websocket';
import { notificationService } from '@/services/api';
import { useTransactionStatistics } from './use-transation-statistics';

import { Notification, NotificationContextType } from '@/types/notification';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


/**
 * NotificationProvider component to provide notification context to the application.
 * @param param0 - React props
 * @returns NotificationProvider component
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(unreadCount);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refreshStatistics: refreshTransactions } = useTransactionStatistics();

  useEffect(()=>{
    unreadCountRef.current=unreadCount;
  },[unreadCount]);

  // WebSocket event handlers
  const handleNewNotification = (notification: any) => {
    setUnreadCount(unreadCountRef.current + 1);
    console.log('WebSocket: Unread count updated to:', unreadCountRef.current + 1);
    
    const transformedNotification = transformNotification(notification);
    setNotifications(prev => [transformedNotification, ...prev]);
    
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
  };

  // Initialize WebSocket
  const { isConnected: isWebSocketConnected } = useWebSocket({
    onNewNotification: handleNewNotification,
    refreshTransactions
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
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
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
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
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
    
    const notificationToDelete = notifications.find(notif => notif.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read;
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
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