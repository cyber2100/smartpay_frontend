import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowDown, 
  ArrowUp, 
  CreditCard,
  DollarSign, 
  Check,
  User,
  PlusIcon,
  MinusIcon,
  ArrowRight,
  Clock,
  Loader2
} from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { useCard } from '@/hooks/use-card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Transaction } from '@/types/payment';
import { useStatistics } from '@/hooks/use-statistics';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { transactions, balance, loadWalletData } = useWallet();
  const { cards, isLoading: cardsLoading } = useCard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'revenue' | 'received' | 'sent'>('all');
  const { getChartData, financialData, refreshStatistics } = useStatistics();
  
  // Fetch transactions and cards from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        navigate('/signin');
      } else if(isAuthenticated && user?.isVerified) {
        await refreshStatistics();
      }
    };
    fetchData();
  }, [isAuthenticated, user?.isVerified]);
  
  // Get recent transactions (latest 5) from backend data
  const recentTransactions = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return [...transactions]
      .sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [transactions]);
  
  /**
   * Formats the date for display.
   * @param timestamp - The timestamp to format.
   * @returns The formatted date string.
   */
  const formatDate = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * Handles navigation - Navigate to '/settings'
   * @param path - The path to navigate to.
   */
  const handleNavigation = (path: string): void => {
    if (path === '/setting') {
      navigate('/setting');
    } else if (path === '/dashboard') {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  /**
   * Gets the title for a transaction based on its type and involved parties.
   * @param transaction - The transaction to get the title for.
   * @returns The title of the transaction.
   */
  const getTransactionTitle = (transaction: Transaction): string => {
    if (!user?.id) return 'Transaction';
    
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit to Account';
      case 'withdraw':
        return 'Withdrawal from Account';
      case 'transfer':
        if (transaction.senderId === user.id) {
          const recipientName = transaction.recipient?.fullname || 
                               transaction.recipient?.email || 
                               'Unknown User';
          return `Transfer to ${recipientName}`;
        } 
        else if (transaction.recipientId === user.id) {
          const senderName = transaction.sender?.fullname || 
                            transaction.sender?.email || 
                            'Unknown User';
          return `Transfer from ${senderName}`;
        }
        return 'Transfer';
      default:
        return `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`;
    }
  };

  /**
   * Gets the icon and color for a transaction based on its type and involved parties.
   * @param transaction - The transaction to get the display information for.
   * @returns An object containing the icon and color classes for the transaction.
   */
  const getTransactionDisplay = (transaction: Transaction) => {
    if (!user?.id) {
      return {
        icon: <DollarSign className="h-4 w-4" />,
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        amountColor: 'text-gray-600'
      };
    }

    const isIncoming = transaction.recipientId === user.id;
    const isOutgoing = transaction.senderId === user.id;
    
    switch (transaction.type) {
      case 'deposit':
        return {
          icon: <PlusIcon className="h-4 w-4" />,
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-600',
          amountColor: 'text-green-600'
        };
      case 'withdraw':
        return {
          icon: <MinusIcon className="h-4 w-4" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-600',
          amountColor: 'text-red-600'
        };
      case 'transfer':
        if (isIncoming && !isOutgoing) {
          return {
            icon: <ArrowDown className="h-4 w-4" />,
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600',
            amountColor: 'text-green-600'
          };
        } else if (isOutgoing) {
          return {
            icon: <ArrowUp className="h-4 w-4" />,
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-600',
            amountColor: 'text-red-600'
          };
        }
        // Fallback for transfer type
        return {
          icon: <ArrowRight className="h-4 w-4" />,
          bgColor: 'bg-purple-500/10',
          textColor: 'text-purple-600',
          amountColor: 'text-purple-600'
        };
      default:
        return {
          icon: <DollarSign className="h-4 w-4" />,
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-600',
          amountColor: 'text-gray-600'
        };
    }
  };

  /**
   * Gets the transaction amount for display.
   * @param transaction - The transaction to get the amount for.
   * @returns The amount to display.
   */
  const getTransactionAmount = (transaction: Transaction): number => {
    if (!user?.id) return transaction.amount;
    
    switch (transaction.type) {
      case 'deposit':
        return transaction.amount;
      case 'withdraw':
        return -transaction.amount;
      case 'transfer':
        if (transaction.recipientId === user.id && transaction.senderId !== user.id) {
          return transaction.amount;
        } 
        else if (transaction.senderId === user.id) {
          return -transaction.amount;
        }
        return transaction.amount;
      default:
        return transaction.amount;
    }
  };

  /**
   * Gets the status badge variant for a transaction.
   * @param status - The status of the transaction.
   * @returns The badge variant class.
   */
  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  /**
   * Gets the transaction details for display.
   * @param transaction - The transaction to get the details for.
   * @returns The transaction details for display.
   */
  const getTransactionDetails = (transaction: Transaction) => {
    const currentUserId = user?.id || 'current_user';
    const isIncoming = transaction.recipientId === currentUserId;
    const isOutgoing = transaction.senderId === currentUserId;
    
    switch (transaction.type) {
      case 'transfer':
        if (isOutgoing) {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  To: {transaction.recipient?.fullname || 'Unknown User'}
                </span>
              </Badge>
              <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-xs">
                {transaction.status}
              </Badge>
            </div>
          );
        } else if (isIncoming) {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  From: {transaction.sender?.fullname || 'Unknown User'}
                </span>
              </Badge>
              <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-xs">
                {transaction.status}
              </Badge>
            </div>
          );
        }
        break;
      case 'deposit':
      case 'withdraw':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {transaction.card?.name || 'Card'}
              </span>
            </Badge>
            <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-xs">
              {transaction.status}
            </Badge>
          </div>
        );
      default:
        return (
          <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-xs">
            {transaction.status}
          </Badge>
        );
    }
  };

  /**
   * Custom tooltip for the chart.
   * @param param0 - The tooltip parameters.
   * @returns The tooltip element.
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{`${label} 2025`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {entry.dataKey}:
                </span>
              </div>
              <span className="font-medium">
                ${entry.value?.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        
        <div className="container px-4 pt-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.fullname || 'User'}</h1>
            <p className="text-muted-foreground">Here's an overview of your account</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10 z-0"></div>
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base">Account Balance</CardTitle>
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <h3 className="text-2xl sm:text-3xl font-bold">
                  ${(balance || financialData.revenue).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Available for transfers and withdrawals</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/10 z-0"></div>
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base">Total Received</CardTitle>
                  <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <h3 className="text-2xl sm:text-3xl font-bold">
                  ${financialData.received.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Money received from other users</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 z-0"></div>
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base">Total Sent</CardTitle>
                  <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <h3 className="text-2xl sm:text-3xl font-bold">
                  ${financialData.sent.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Money sent to other users</p>
              </CardContent>
            </Card>
          </div>
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Monthly Account Activity</CardTitle>
                  <CardDescription className="text-sm">
                    Monthly transfer activity trends over time
                  </CardDescription>
                </div>
                <Tabs 
                  defaultValue="all" 
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as 'all' | 'revenue' | 'received' | 'sent')} 
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                    <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
                    <TabsTrigger value="received" className="text-xs sm:text-sm">Received</TabsTrigger>
                    <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80 lg:h-96">
                {getChartData().some(item => item.revenue > 0 || item.received > 0 || item.sent > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    
                    {/* Show all lines when activeTab is 'all' */}
                    {(activeTab === 'all' || activeTab === 'revenue') && (
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                        name="Revenue"
                      />
                    )}
                    {(activeTab === 'all' || activeTab === 'received') && (
                      <Line 
                        type="monotone" 
                        dataKey="received" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2, fill: '#ffffff' }}
                        name="Received"
                      />
                    )}
                    {(activeTab === 'all' || activeTab === 'sent') && (
                      <Line 
                        type="monotone" 
                        dataKey="sent" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                        name="Sent"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>): (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className="h-12 w-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No Activity Data</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your account activity chart will appear here once you start making transactions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                      <CardDescription className="text-sm">
                        Account transfers, deposits, and withdrawals
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleNavigation('/history')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((tx) => {
                        const display = getTransactionDisplay(tx);
                        const amount = getTransactionAmount(tx);
                        const title = getTransactionTitle(tx);
                        
                        return (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`p-2 rounded-full ${display.bgColor} flex-shrink-0`}>
                                <div className={display.textColor}>
                                  {display.icon}
                                </div>
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm sm:text-base truncate">{title}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(tx.timestamp)}
                                  </p>
                                  {getTransactionDetails(tx)}
                                </div>
                                {tx.description && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {tx.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className={`font-medium ${amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {amount < 0 ? '-' : '+'}
                                ${Math.abs(amount).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-8 border rounded-lg">
                        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No recent transactions</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Start by making a deposit or transfer
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Linked Cards</CardTitle>
                      <CardDescription className="text-sm">Cards for deposits and withdrawals</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleNavigation('/card')}>
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {cardsLoading ? (
                    <div className="text-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Loading your cards...</p>
                    </div>
                  ) : cards.length > 0 ? (
                    cards.slice(0, 5).map((card) => (
                      <div key={card.id} className={`relative overflow-hidden rounded-lg p-4 border hover:bg-muted/50 transition-colors ${card.isDefault ? 'ring-2 ring-primary' : ''}`}>
                        <div className={`absolute top-0 left-0 h-full w-2 ${card.cardColor}`}></div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-background flex-shrink-0">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="font-medium text-sm sm:text-base">{card.name}</p>
                              {card.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Default
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{card.cardNumber}</p>
                            <div className="flex gap-4 mt-1">
                              <p className="text-xs">Exp: {card.expireDate}</p>
                              <p className="text-xs">CVC: {card.cvc}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 border rounded-lg">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No cards linked</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add a payment card to get started
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => handleNavigation('/card')}
                      >
                        Add Card
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;