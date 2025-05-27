import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { notificationService } from '@/services/api';

// Types
export interface Notification {
  id: string;
  type: 'received' | 'system' | 'transfer' | 'deposit' | 'withdraw';
  amount?: number;
  from?: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  transaction_id?: string;
  from_user?: {
    id: string;
    fullname: string;
    email: string;
  };
}

export type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Transform API notifications to our app format
  const transformNotification = (apiNotification: any): Notification => ({
    id: apiNotification.id,
    type: apiNotification.type,
    amount: apiNotification.amount,
    from: apiNotification.from_user?.fullname || apiNotification.from_user?.email || apiNotification.from,
    title: apiNotification.title,
    message: apiNotification.message,
    timestamp: new Date(apiNotification.created_at),
    read: apiNotification.read,
    transaction_id: apiNotification.transaction_id,
    from_user: apiNotification.from_user
  });

  // Get all notifications
  const getNotifications = async (): Promise<void> => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      const formattedNotifications = response.map(transformNotification);
      setNotifications(formattedNotifications);
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
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
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
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
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
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
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

  // Load notifications when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      getNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Value to provide
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
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