import React, { ReactElement } from "react";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useNavigate } from "react-router-dom";
import { Notification, mockNotifications } from "@/mockData/notification";

export function NotificationDropdown(): ReactElement {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    isWebSocketConnected,
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();

  const formatTime = (date: Date): string => {
    const now: Date = new Date();
    const diffMs: number = now.getTime() - date.getTime();
    const diffMins: number = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 24 * 60) {
      const hours: number = Math.floor(diffMins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days: number = Math.floor(diffMins / (24 * 60));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleNotificationClick = async (notificationId: string): Promise<void> => {
    await markAsRead(notificationId);
    navigate(`/notifications/?id=${notificationId}`);
  };

  const sortedNotifications = [...(notifications.length ? notifications : mockNotifications)].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleToNotification = (): void => {
    navigate('/notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {/* WebSocket connection indicator */}
          <span 
            className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
              isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isWebSocketConnected ? 'Real-time connected' : 'Real-time disconnected'}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Notifications</span>
            {isWebSocketConnected ? (
              <span title="Real-time connected">
                <Wifi className="h-4 w-4 text-green-500" />
              </span>
            ) : (
              <span title="Real-time disconnected">
                <WifiOff className="h-4 w-4 text-red-500" />
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7" 
              onClick={markAllAsRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : sortedNotifications.length > 0 ? (
            <DropdownMenuGroup>
              {sortedNotifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">
                        {notification.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.metadata?.amount && (
                      <p className="text-xs font-medium text-green-600">
                        ${notification.metadata?.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You have no notifications
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" asChild>
          <a href="#" onClick={handleToNotification} className="w-full text-center">View all notifications</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}