import React, { useEffect, useState } from 'react';
import { Bell, X, Clock, CheckCircle, AlertTriangle, Info, User, DollarSign, CreditCard, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/animated-background';
import { useAuth } from '@/hooks/use-auth';

// Type definitions for notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'system' | 'promotion';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  timestamp: Date;
  metadata?: {
    transactionId?: string;
    amount?: number;
    userId?: string;
    actionUrl?: string;
  };
}

const Notifications: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
        // If user is not authenticated, redirect to sign-in page
      return navigate('/signin');
    }
    
    // Mock notifications data - replace with actual API call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Transfer Received',
        message: 'You received $250.00 from John Smith',
        type: 'transaction',
        priority: 'medium',
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: {
          transactionId: 'tx_123',
          amount: 250.00,
          userId: 'user_456'
        }
      },
      {
        id: '2',
        title: 'Security Alert',
        message: 'New device login detected from Chrome on Windows',
        type: 'security',
        priority: 'high',
        isRead: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: '3',
        title: 'Deposit Successful',
        message: 'Your deposit of $500.00 has been processed successfully',
        type: 'transaction',
        priority: 'low',
        isRead: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: {
          transactionId: 'tx_789',
          amount: 500.00
        }
      },
      {
        id: '4',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur on Sunday 2:00 AM - 4:00 AM EST',
        type: 'system',
        priority: 'medium',
        isRead: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '5',
        title: 'Special Offer',
        message: 'Get 2% cashback on all transfers this month!',
        type: 'promotion',
        priority: 'low',
        isRead: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        metadata: {
          actionUrl: '/promotions'
        }
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  // Format timestamp for display
  const formatDate = (timestamp: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }).format(timestamp);
    }
  };

  // Get notification icon and colors based on type and priority
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
    
    // Adjust for priority
    if (notification.priority === 'high' && !notification.isRead) {
      return {
        ...display,
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-300'
      };
    }
    
    return display;
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    // Mark as read if not already
    if (!notification.isRead) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        
        <div className="container px-4 pt-8 max-w-4xl mx-auto">
          {/* Header */}
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
                  onClick={markAllAsRead}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
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
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`
                          flex items-start gap-4 p-4 rounded-lg border cursor-pointer
                          transition-all duration-200 hover:bg-muted/50 hover:shadow-sm
                          ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-card'}
                          ${display.borderColor}
                        `}
                      >
                        <div className={`p-2 rounded-full ${display.bgColor} flex-shrink-0`}>
                          <div className={display.textColor}>
                            {display.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                                {!notification.isRead && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.timestamp)}
                            </div>
                          </div>
                          
                          {notification.metadata?.amount && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-green-600">
                                ${notification.metadata.amount.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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

      {/* Modal */}
      {isModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Notification Details</h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className={`capitalize ${
                        selectedNotification.priority === 'high' ? 'text-red-600' :
                        selectedNotification.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {selectedNotification.priority}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button onClick={closeModal} className="flex-1">
                  Close
                </Button>
                {selectedNotification.metadata?.actionUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate(selectedNotification.metadata!.actionUrl!);
                      closeModal();
                    }}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;