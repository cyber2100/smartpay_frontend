import React, { useState, ReactElement } from "react";
import { Bell } from "lucide-react";
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

interface Transaction {
  id: string;
  type: 'received' | 'system';
  amount: number;
  from: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationDropdown(): ReactElement {
  const { user } = useAuth();
  
  // This would typically come from an API call or context
  const [notifications, setNotifications] = useState<Transaction[]>([
    {
      id: "1",
      type: "received",
      amount: 50.0,
      from: "Sarah Johnson",
      timestamp: new Date(Date.now() - 30 * 60000), // 30 mins ago
      read: false,
    },
    {
      id: "2",
      type: "system",
      amount: 0,
      from: "System",
      timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      read: false,
    },
    {
      id: "3",
      type: "received",
      amount: 25.75,
      from: "Michael Chen",
      timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
      read: true,
    }
  ]);

  const unreadCount: number = notifications.filter((notif: Transaction) => !notif.read).length;

  const markAsRead = (id: string): void => {
    setNotifications(
      notifications.map((notif: Transaction) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = (): void => {
    setNotifications(
      notifications.map((notif: Transaction) => ({ ...notif, read: true }))
    );
  };

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

  const handleNotificationClick = (id: string): void => {
    markAsRead(id);
  };

  const getNotificationTitle = (notification: Transaction): string => {
    return notification.type === 'received' ? 'Payment Received' : 'System Notification';
  };

  const getNotificationMessage = (notification: Transaction): string => {
    return notification.type === 'received' 
      ? `${notification.from} sent you $${notification.amount.toFixed(2)}` 
      : 'Your account has been verified successfully.';
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
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7" 
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <DropdownMenuGroup>
              {notifications.map((notification: Transaction) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">
                        {getNotificationTitle(notification)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getNotificationMessage(notification)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You have no new notifications
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" asChild>
          <a href="/history" className="w-full text-center">View all transactions</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}