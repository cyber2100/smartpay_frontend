/**
 * Notification type definition
 * Represents a notification in the application.
 * @property {string} id - Unique identifier for the notification
 * @property {string} title - Title of the notification
 * @property {string} message - Message content of the notification
 * @property {'transaction' | 'system'} type - Type of notification (transaction or system)
 * @property {boolean} read - Indicates if the notification has been read
 * @property {Date} timestamp - Timestamp when the notification was created
 */
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

/**
 * Notification context type definition
 * Provides methods and state related to notifications in the application.
 * @property {Notification[]} notifications - List of notifications
 * @property {number} unreadCount - Count of unread notifications
 * @property {boolean} loading - Indicates if notifications are being loaded
 * @property {boolean} isWebSocketConnected - Indicates if WebSocket connection is active
 * @property {() => Promise<void>} getNotifications - Function to fetch notifications
 * @property {(notificationId: string) => Promise<boolean>} markAsRead - Function to mark a notification as read
 * @property {() => Promise<boolean>} markAllAsRead - Function to mark all notifications as read
 * @property {(notificationId: string) => Promise<boolean>} deleteNotification - Function to delete a notification
 * @property {() => Promise<void>} refreshNotifications - Function to refresh notifications
 */
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