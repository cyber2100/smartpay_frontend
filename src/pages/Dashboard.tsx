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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { PaymentCard, Transaction, MonthlyData, FinancialData } from '@/types/payment';

// Updated transaction type to properly distinguish between account transfers and card operations
interface AccountTransaction extends Omit<Transaction, 'cardUsed'> {
  type: 'sent' | 'received' | 'deposit' | 'withdrawal';
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
  const [activeTab, setActiveTab] = useState<'balance' | 'received' | 'sent'>('balance');
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
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        
        <div className="container px-4 pt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}</h1>
            <p className="text-muted-foreground">Here's an overview of your account</p>
          </div>
          
          {/* Currency stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10 z-0"></div>
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Account Balance</CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <h3 className="text-3xl font-bold">
                  ${financialData.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">Available for transfers and withdrawals</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/10 z-0"></div>
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Total Received</CardTitle>
                  <ArrowDown className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <h3 className="text-3xl font-bold">
                  ${financialData.received.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">Money received from other users</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 z-0"></div>
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Total Sent</CardTitle>
                  <ArrowUp className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <h3 className="text-3xl font-bold">
                  ${financialData.sent.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">Money sent to other users</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart section - Bar Chart */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Account Activity</CardTitle>
                <Tabs defaultValue="balance" value={activeTab} onValueChange={(value) => setActiveTab(value as 'balance' | 'received' | 'sent')} className="w-auto">
                  <TabsList className="grid grid-cols-3 w-80">
                    <TabsTrigger value="balance">Balance</TabsTrigger>
                    <TabsTrigger value="received">Received</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Monthly transfer activity between user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        const labels = {
                          balance: 'Net Balance',
                          received: 'Received',
                          sent: 'Sent'
                        };
                        return [`$${value}`, labels[name as keyof typeof labels] || name];
                      }}
                      labelFormatter={(label) => `${label} 2025`}
                    />
                    <Legend />
                    {activeTab === 'balance' && (
                      <Bar dataKey="balance" fill="#3b82f6" name="Balance" />
                    )}
                    {activeTab === 'received' && (
                      <Bar dataKey="received" fill="#22c55e" name="Received" />
                    )}
                    {activeTab === 'sent' && (
                      <Bar dataKey="sent" fill="#ef4444" name="Sent" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Dashboard main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Activity</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleNavigation('/history')}>
                      View All
                    </Button>
                  </div>
                  <CardDescription>
                    Account transfers, deposits, and withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted">
                            {getTransactionIcon(tx)}
                          </div>
                          
                          <div>
                            <p className="font-medium">{tx.title}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDate(tx.date)}
                              </p>
                              {getTransactionDetails(tx)}
                            </div>
                            {tx.reference && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {tx.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
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
            
            {/* User's Payment Cards - For deposits/withdrawals only */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Linked Cards</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleNavigation('/setting')}>
                      Manage
                    </Button>
                  </div>
                  <CardDescription>Cards for deposits and withdrawals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentCards.map((card) => (
                    <div key={card.id} className={`relative overflow-hidden rounded-lg p-4 border ${card.isDefault ? 'ring-2 ring-primary' : ''}`}>
                      <div className={`absolute top-0 left-0 h-full w-2 ${card.cardColor}`}></div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-background">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{card.name}</p>
                            {card.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Default
                                </span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
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