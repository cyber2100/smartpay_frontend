import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowDown, 
  ArrowUp, 
  CreditCard,
  DollarSign, 
  Check,
  User,
  Wallet,
} from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { PaymentCard, Transaction, MonthlyData, FinancialData } from '@/types/payment';

// Updated transaction type to properly distinguish between account transfers and card operations
interface AccountTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'sent' | 'received' | 'deposit' | 'withdrawal';
  date: Date;
  // For sent/received: other user account details
  otherUser?: {
    id: string;
    name: string;
    email?: string;
  };
  // For deposit/withdrawal: card used
  cardUsed?: PaymentCard;
  // Transaction fee (if any)
  fee?: number;
  // Reference/memo
  reference?: string;
}

const currencyData: MonthlyData[] = [
  { name: 'Jan', received: 2000, sent: 1200, balance: 800 },
  { name: 'Feb', received: 3200, sent: 1300, balance: 1900 },
  { name: 'Mar', received: 2800, sent: 1400, balance: 1400 },
  { name: 'Apr', received: 4500, sent: 2300, balance: 2200 },
  { name: 'May', received: 3800, sent: 1700, balance: 2100 },
  { name: 'Jun', received: 6200, sent: 2800, balance: 3400 },
  { name: 'Jul', received: 5800, sent: 2500, balance: 3300 },
  { name: 'Aug', received: 5200, sent: 2400, balance: 2800 },
  { name: 'Sep', received: 6100, sent: 2800, balance: 3300 },
  { name: 'Oct', received: 7200, sent: 3000, balance: 4200 },
  { name: 'Nov', received: 6800, sent: 3000, balance: 3800 },
  { name: 'Dec', received: 8500, sent: 3900, balance: 4600 }
];

const Dashboard: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'balance' | 'received' | 'sent'>('all');
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    { 
      id: 'card1', 
      name: 'Chase Sapphire', 
      cardNumber: '**** **** **** 4567', 
      expireDate: '05/27', 
      cvc: '***', 
      isDefault: true,
      type: 'visa',
      cardColor: 'bg-blue-500'
    },
    { 
      id: 'card2', 
      name: 'Citibank Premier', 
      cardNumber: '**** **** **** 8923', 
      expireDate: '11/26', 
      cvc: '***', 
      isDefault: false,
      type: 'mastercard',
      cardColor: 'bg-purple-500'
    },
    { 
      id: 'card3', 
      name: 'American Express', 
      cardNumber: '**** ****** 61005', 
      expireDate: '03/28', 
      cvc: '****', 
      isDefault: false,
      type: 'amex',
      cardColor: 'bg-green-500'
    }
  ]);
  
  // FIXED: Calculate correct financial data - balance = received - sent
  const totalReceived = currencyData.reduce((sum, month) => sum + month.received, 0);
  const totalSent = currencyData.reduce((sum, month) => sum + month.sent, 0);
  
  const financialData: FinancialData = {
    balance: totalReceived - totalSent, // FIXED: balance = received - sent
    sent: totalSent,
    received: totalReceived,
  };
  
  // Update currencyData with correct balance calculation
  const correctedCurrencyData: MonthlyData[] = currencyData.map(month => ({
    ...month,
    balance: month.received - month.sent // FIXED: balance = received - sent for each month
  }));
  
  // FIXED: Recent transactions now properly separate account transfers from card operations
  const recentTransactions: AccountTransaction[] = [
    { 
      id: 'tx1', 
      title: 'Payment from Alex', 
      amount: 750.00, 
      type: 'received', 
      date: new Date(2025, 4, 20, 14, 30),
      otherUser: {
        id: 'user_alex_123',
        name: 'Alex Johnson',
        email: 'alex.johnson@email.com'
      },
      reference: 'Freelance work - May project'
    },
    { 
      id: 'tx2', 
      title: 'Sent to landlord', 
      amount: 1200.00, 
      type: 'sent', 
      date: new Date(2025, 4, 18, 9, 15),
      otherUser: {
        id: 'user_landlord_456',
        name: 'Property Management LLC',
        email: 'payments@propertymanagement.com'
      },
      reference: 'Monthly rent - May 2025'
    },
    { 
      id: 'tx3', 
      title: 'Payment from TechSolutions', 
      amount: 1200.00, 
      type: 'received', 
      date: new Date(2025, 4, 15, 16, 45),
      otherUser: {
        id: 'user_techsol_789',
        name: 'TechSolutions Inc.',
        email: 'billing@techsolutions.com'
      },
      reference: 'Invoice #1082 - Development services'
    },
    { 
      id: 'tx4', 
      title: 'Account funding', 
      amount: 500.00, 
      type: 'deposit', 
      date: new Date(2025, 4, 12, 17, 30),
      cardUsed: paymentCards.find(card => card.id === 'card1'),
      reference: 'Top up account balance'
    },
    { 
      id: 'tx5', 
      title: 'Cash withdrawal', 
      amount: 200.00, 
      type: 'withdrawal', 
      date: new Date(2025, 4, 10, 11, 20),
      cardUsed: paymentCards.find(card => card.id === 'card2'),
      reference: 'Transfer to bank account'
    },
  ];
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get data for selected tab
  const getChartData = (): MonthlyData[] => {
    return correctedCurrencyData; // Use corrected data
  };
  
  // Handle navigation - Navigate to '/settings'
  const handleNavigation = (path: string): void => {
    if (path === '/setting') {
      navigate('/setting');
    } else if (path === '/dashboard') {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  // Get appropriate icon for transaction type
  const getTransactionIcon = (transaction: AccountTransaction) => {
    switch (transaction.type) {
      case 'sent':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'received':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'deposit':
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'withdrawal':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Get transaction amount display
  const getTransactionAmount = (transaction: AccountTransaction) => {
    const isNegative = transaction.type === 'sent' || transaction.type === 'withdrawal';
    const prefix = isNegative ? '-' : '+';
    const colorClass = isNegative ? 'text-destructive' : 'text-primary';
    
    return (
      <p className={`font-medium ${colorClass}`}>
        {prefix}${transaction.amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </p>
    );
  };

  // Get transaction details for display
  const getTransactionDetails = (transaction: AccountTransaction) => {
    switch (transaction.type) {
      case 'sent':
      case 'received':
        return (
          <Badge variant="outline" className="text-xs">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {transaction.type === 'sent' ? 'To: ' : 'From: '}
              {transaction.otherUser?.name}
            </span>
          </Badge>
        );
      case 'deposit':
      case 'withdrawal':
        return (
          <Badge variant="outline" className="text-xs">
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {transaction.cardUsed?.name || 'Card'}
            </span>
          </Badge>
        );
      default:
        return null;
    }
  };

  // Custom tooltip for the chart
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
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name || 'User'}</h1>
            <p className="text-muted-foreground">Here's an overview of your account</p>
          </div>
          
          {/* Currency stats cards - Responsive grid */}
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
                  ${financialData.balance.toLocaleString('en-US', {
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
          
          {/* Chart section - Line Chart with improved responsive design */}
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
                  onValueChange={(value) => setActiveTab(value as 'all' | 'balance' | 'received' | 'sent')} 
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                    <TabsTrigger value="balance" className="text-xs sm:text-sm">Balance</TabsTrigger>
                    <TabsTrigger value="received" className="text-xs sm:text-sm">Received</TabsTrigger>
                    <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80 lg:h-96">
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
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
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
                    {(activeTab === 'all' || activeTab === 'balance') && (
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                        name="Balance"
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
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Dashboard main content - Responsive layout */}
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
                    {recentTransactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 rounded-full bg-muted flex-shrink-0">
                            {getTransactionIcon(tx)}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{tx.title}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDate(tx.date)}
                              </p>
                              {getTransactionDetails(tx)}
                            </div>
                            {tx.reference && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {tx.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0 ml-3">
                          {getTransactionAmount(tx)}
                          {tx.fee && (
                            <p className="text-xs text-muted-foreground">
                              Fee: ${tx.fee.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* User's Payment Cards - Responsive sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Linked Cards</CardTitle>
                      <CardDescription className="text-sm">Cards for deposits and withdrawals</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleNavigation('/setting')}>
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {paymentCards.map((card) => (
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
                  ))}
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