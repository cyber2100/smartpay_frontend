import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, X, Clock, CheckCircle, AlertTriangle, Info, DollarSign, ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from '@/components/animated-background';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';

import { Notification } from '@/types/notification';
import { mockNotifications } from '@/mockData/notification';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Notifications: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedNotificationId, setHighlightedNotificationId] = useState<string | null>(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const { 
    notifications: realNotifications, 
    deleteNotification, 
    markAllAsRead, 
    markAsRead } = useNotifications();
  const location = useLocation();
  const selectedNotificationId = location.search.split("?id=")[1];
  
  const navigate = useNavigate();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return navigate('/signin');
    }
  }, [])

  // Load notifications from the hook or mock data
  useEffect(() => {
    if (realNotifications.length) {
      setNotifications([...realNotifications]);
    } else {
      setNotifications([...mockNotifications]);
    }
  }, [realNotifications])

  // Handle highlighting selected notification from URL
  useEffect(() => {
    if (selectedNotificationId && notifications.length > 0) {
      const targetNotification = notifications.find(n => n.id === selectedNotificationId);
      if (targetNotification) {
        setHighlightedNotificationId(selectedNotificationId);
        
        // Auto-scroll to the notification after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`notification-${selectedNotificationId}`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 100);

        // Remove highlight after 3 seconds
        setTimeout(() => {
          setHighlightedNotificationId(null);
        }, 3000);
      }
    }
  }, [selectedNotificationId, notifications]);

  /**
   * Formats a date into a readable string.
   * @param timestamp - The timestamp to format.
   * @returns The formatted date string.
   */
  const formatDate = (timestamp: Date): string => {
    const timeAgo = dayjs(timestamp + "Z").fromNow();
    return timeAgo;
  };

  /**
   * Gets the display information for a notification.
   * @param notification - The notification to get the display information for.
   * @returns The display information for the notification.
   */
  const getNotificationDisplay = (notification: Notification) => {
    const baseDisplay = {
      transaction: {
        icon: <DollarSign className="h-4 w-4" />,
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      },
      security: {
        icon: <AlertTriangle className="h-4 w-4" />,
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      },
      system: {
        icon: <Info className="h-4 w-4" />,
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200'
      },
      promotion: {
        icon: <Bell className="h-4 w-4" />,
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-600',
        borderColor: 'border-green-200'
      }
    };

    const display = baseDisplay[notification.type];
    
    if (!notification.read) {
      return {
        ...display,
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-300'
      };
    }
    
    return display;
  };

  /**
   * Handles the click event for a notification.
   * @param notification - The notification that was clicked.
   */
  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    await markAsRead(notification.id);
    
    if (selectedNotificationId) {
      navigate(location.pathname, { replace: true });
    }
    
    if (!notification.read) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
  };

  /**
   * Handles the delete notification event.
   * @param e - The mouse event.
   * @param notificationId - The ID of the notification to delete.
   */
  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();

    setDeletingNotificationId(notificationId);
    
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingNotificationId(null);
    }
  };

  // Closes the notification modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // Handles marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const sortedNotifications = [...notifications].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        
        <div className="container px-4 pt-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <Bell className="h-7 w-7 text-blue-600" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground">Stay updated with your account activity</p>
              </div>
              
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">All Notifications</CardTitle>
              <CardDescription>Recent updates and alerts for your account</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {sortedNotifications.length > 0 ? (
                  sortedNotifications.map((notification) => {
                    const display = getNotificationDisplay(notification);
                    const isHighlighted = highlightedNotificationId === notification.id;
                    const isDeleting = deletingNotificationId === notification.id;
                    
                    return (
                      <div
                        key={notification.id}
                        id={`notification-${notification.id}`}
                        onClick={() => handleNotificationClick(notification)}
                        className={`
                          flex items-start gap-4 p-4 rounded-lg border cursor-pointer
                          transition-all duration-300 hover:bg-muted/50 hover:shadow-sm group
                          ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-card'}
                          ${display.borderColor}
                          ${isHighlighted ? 
                            'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-[1.02] bg-blue-50 dark:bg-blue-950/30 border-blue-400' : 
                            ''
                          }
                          ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
                        `}
                        style={{
                          animation: isHighlighted ? 'pulse 0.8s ease-in-out 2' : undefined
                        }}
                      >
                        <div className={`p-2 rounded-full ${display.bgColor} flex-shrink-0 ${isHighlighted ? 'scale-110' : ''} transition-transform duration-300`}>
                          <div className={display.textColor}>
                            {display.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'} ${isHighlighted ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                {notification.title}
                                {!notification.read && (
                                  <span className={`inline-block w-2 h-2 rounded-full ml-2 ${isHighlighted ? 'bg-blue-600 animate-pulse' : 'bg-blue-500'}`}></span>
                                )}
                                {isHighlighted && (
                                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full ml-2 animate-ping"></span>
                                )}
                              </p>
                              <p className={`text-sm mt-1 line-clamp-2 ${isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className={`flex items-center gap-2 text-xs flex-shrink-0 ${isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.timestamp)}
                            </div>
                          </div>
                          
                          {notification.metadata?.amount && (
                            <div className="mt-2">
                              <span className={`text-sm font-medium ${isHighlighted ? 'text-emerald-600' : 'text-green-600'}`}>
                                ${notification.metadata.amount.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            disabled={isDeleting}
                            className={`
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20
                              ${isDeleting ? 'opacity-50' : ''}
                            `}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <ArrowRight className={`h-4 w-4 ${isHighlighted ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-muted-foreground'} transition-all duration-300`} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No notifications yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll see updates about your account activity here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Notification Details</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(e, selectedNotification.id);
                    closeModal();
                  }}
                  className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full ${getNotificationDisplay(selectedNotification).bgColor}`}>
                  <div className={getNotificationDisplay(selectedNotification).textColor}>
                    {getNotificationDisplay(selectedNotification).icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">{selectedNotification.title}</h3>
                  <p className="text-muted-foreground mb-3">{selectedNotification.message}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(selectedNotification.timestamp)}
                  </div>
                </div>
              </div>
              
              {selectedNotification.metadata && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2">Additional Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedNotification.metadata.amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium text-green-600">
                          ${selectedNotification.metadata.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    )}
                    {selectedNotification.metadata.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono text-xs">{selectedNotification.metadata.transactionId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedNotification.type}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button onClick={closeModal} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;