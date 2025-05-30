import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface WebSocketMessage {
  type: 'notification_count_update' | 'new_notification' | 'notification_read';
  data: {
    unreadCount?: number;
    notification?: any;
    notificationId?: string;
  };
}

interface UseWebSocketProps {
  onUnreadCountUpdate?: (count: number) => void;
  onNewNotification?: (notification: any) => void;
  onNotificationRead?: (notificationId: string) => void;
}

export const useWebSocket = ({
  onUnreadCountUpdate,
  onNewNotification,
  onNotificationRead
}: UseWebSocketProps = {}) => {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    const userId = user.id;

    try {
      // WebSocket URL - adjust this to match your backend
      const wsUrl = `ws://146.19.215.133:8000/ws/notifications/${userId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected ========================================= >');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };

      wsRef.current.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        console.log(":bell: Received notification:", notification);
        // You can trigger toast or update global state here

        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'notification_count_update':
              if (message.data.unreadCount !== undefined && onUnreadCountUpdate) {
                onUnreadCountUpdate(message.data.unreadCount);
              }
              break;
              
            case 'new_notification':
              if (message.data.notification && onNewNotification) {
                onNewNotification(message.data.notification);
              }
              // Also update unread count if provided
              if (message.data.unreadCount !== undefined && onUnreadCountUpdate) {
                onUnreadCountUpdate(message.data.unreadCount);
              }
              break;
              
            case 'notification_read':
              if (message.data.notificationId && onNotificationRead) {
                onNotificationRead(message.data.notificationId);
              }
              // Also update unread count if provided
              if (message.data.unreadCount !== undefined && onUnreadCountUpdate) {
                onUnreadCountUpdate(message.data.unreadCount);
              }
              break;
              
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [isAuthenticated, user, onUnreadCountUpdate, onNewNotification, onNotificationRead]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Connect when authenticated, disconnect when not
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    reconnect: connect,
    disconnect
  };
};