import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useWallet } from './use-wallet';

interface UseWebSocketProps {
  onNewNotification?: (notification: any) => void;
  loadWalletData?: () => void;
}

/**
 * Custom hook to manage WebSocket connections for notifications.
 * Automatically reconnects on disconnection and handles incoming messages.
 *
 * @param {UseWebSocketProps} props - Optional properties for handling new notifications and refreshing transactions.
 * @returns {Object} - An object containing WebSocket connection status and methods to send messages, reconnect, and disconnect.
 */
export const useWebSocket = ({
  onNewNotification,
  loadWalletData,
}: UseWebSocketProps = {}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  

  /**
   * Function to connect to the WebSocket server.
   */
  const connect = useCallback(() => {
    if (!isAuthenticated || !user || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    const userId = user.id;

    try {
      // WebSocket URL - adjust this to match your backend
      const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
      const wsUrl = `${baseUrl}/${userId}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };

      wsRef.current.onmessage = async (event) => {
        const notification = JSON.parse(event.data);
        
        try {
          const newData = notification.data;
          console.log(":bell: Received notification:", newData);
          if (newData && onNewNotification) {
            onNewNotification(newData);
            await loadWalletData();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
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
  }, [isAuthenticated, user, onNewNotification]);

  /**
   * Function to disconnect from the WebSocket server.
   * Clears any existing reconnect timeout.
   * Closes the WebSocket connection gracefully.
   * If the WebSocket is already closed, it does nothing.
   * This function can be called manually to stop receiving notifications.
   * It also resets the reconnect attempts and clears the timeout.
   * @returns {void}
   */
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

  /**
   * Function to send a message through the WebSocket connection.
   * It checks if the WebSocket is open before sending.
   * If the WebSocket is not connected, it logs a warning.
   * @param {any} message - The message to send, which will be stringified.
   * @returns {void}
   */
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