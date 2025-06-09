import React, { ReactElement, useState } from "react";
import { Bell, Wifi, WifiOff, Trash2, X } from "lucide-react";
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
import { useNotifications } from "@/hooks/use-notifications";
import { useNavigate } from "react-router-dom";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function NotificationDropdown(): ReactElement {
  const {
    notifications,
    unreadCount,
    loading,
    isWebSocketConnected,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const navigate = useNavigate();
  const [deletingNotificationId, setDeletingNotificationId] = useState<
    string | null
  >(null);

  /**
   * Formats a date to a human-readable time ago format.
   * @param date - The date to format.
   * @returns A string representing the time ago.
   */
  const formatTime = (date: Date): string => {
    const timeAgo = dayjs(date + "Z").fromNow();
    return timeAgo;
  };

  /**
   * Handles the click event for a notification.
   * @param notificationId - The ID of the notification to view.
   */
  const handleNotificationClick = async (
    notificationId: string
  ): Promise<void> => {
    navigate(`/notifications/?id=${notificationId}`);
  };

  /**
   * Handles the delete notification event.
   * @param e - The mouse event.
   * @param notificationId - The ID of the notification to delete.
   */
  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ): Promise<void> => {
    e.stopPropagation();

    setDeletingNotificationId(notificationId);

    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeletingNotificationId(null);
    }
  };

  /**
   * Sorts notifications by timestamp in descending order.
   * @returns An array of sorted notifications.
   */
  const sortedNotifications = notifications.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Handles navigation to the notifications page.
  const handleToNotification = (): void => {
    navigate("/notifications");
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
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span
            className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
              isWebSocketConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={
              isWebSocketConnected
                ? "Real-time connected"
                : "Real-time disconnected"
            }
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
          ) : sortedNotifications?.length > 0 ? (
            <DropdownMenuGroup>
              {sortedNotifications?.slice(0, 10).map((notification) => {
                const isDeleting = deletingNotificationId === notification.id;

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`
                      p-0 cursor-pointer group relative
                      ${!notification.read ? "bg-muted/50" : ""}
                      ${isDeleting ? "opacity-50 pointer-events-none" : ""}
                    `}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex w-full">
                      {/* Main notification content */}
                      <div className="flex flex-col space-y-1 w-full p-3 pr-10">
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

                      {/* Delete button - positioned absolutely to overlay on hover */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                          onClick={(e) =>
                            handleDeleteNotification(e, notification.id)
                          }
                          disabled={isDeleting}
                          title="Delete notification"
                        >
                          {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You have no notifications
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" asChild>
          <a
            href="#"
            onClick={handleToNotification}
            className="w-full text-center"
          >
            View all notifications
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
