import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Info, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
  description: string;
  type: string;
  status: 'completed' | 'pending' | 'failed';
  senderId?: string;
  recipientId?: string;
  cardId?: string;
  sender?: {
    id: string;
    fullname: string;
    email: string;
    phone: string | null;
  } | null;
  recipient?: {
    id: string;
    fullname: string;
    email: string;
    phone: string | null;
  } | null;
  card?: {
    id: string;
    name: string;
  } | null;
}

interface MonthlyStats {
  month: string;
  monthNumber: number;
  averageAmount: number;
  totalTransactions: number;
  totalVolume: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

// Mock data generator (preserved for fallback)
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const currentYear = new Date().getFullYear();
  const descriptions = ['Online Purchase', 'Coffee Shop', 'Gas Station', 'Grocery Store', 'Restaurant', 'Subscription', 'Transfer', 'ATM Withdrawal'];
  
  // Generate transactions for each month
  for (let month = 0; month < 6; month++) { // First 6 months of the year
    const transactionCount = Math.floor(Math.random() * 20) + 15; // 15-35 transactions per month
    
    for (let i = 0; i < transactionCount; i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const baseAmount = 50 + (month * 10); // Gradually increasing amounts
      const amount = baseAmount + (Math.random() * 200) - 100; // Add some variance
      
      transactions.push({
        id: `mock-${month}-${i}`,
        amount: Math.max(amount, 5), // Ensure positive amounts
        timestamp: new Date(currentYear, month, day).toISOString(),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        type: ['deposit', 'withdraw', 'transfer'][Math.floor(Math.random() * 3)],
        status: 'completed'
      });
    }
  }
  
  return transactions;
};

const TransactionStatistics: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { transactions, getTransactions } = useWallet();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from backend
  const fetchBackendTransactions = async () => {
    if (!isAuthenticated || !user) {
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const backendTransactions = await getTransactions();
      setLastFetchTime(new Date());
      return backendTransactions;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching backend transactions:', err);
      
      toast({
        title: "Failed to load transactions",
        description: errorMessage,
        variant: "destructive"
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBackendTransactions();
    }
  }, [isAuthenticated, user]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchBackendTransactions();
  };

  // Determine which data to use
  const allTransactions = useMemo(() => {
    // If we have backend transactions, use them
    if (transactions && transactions.length > 0) {
      return transactions.map(tx => ({
        ...tx,
        // Ensure timestamp is a string for consistency
        timestamp: typeof tx.timestamp === 'string' ? tx.timestamp : tx.timestamp.toISOString(),
        // Ensure description exists
        description: tx.description || `${tx.type} transaction`,
        // Ensure amount is absolute for statistics
        amount: Math.abs(tx.amount)
      }));
    }
    
    // Fallback to mock data if no backend data or not authenticated
    return generateMockTransactions();
  }, [transactions]);

  const isUsingMockData = useMemo(() => {
    return !isAuthenticated || !transactions || transactions.length === 0;
  }, [isAuthenticated, transactions]);

  const monthlyStats: MonthlyStats[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const stats: MonthlyStats[] = [];

    // Process each month from January to current month
    for (let monthIndex = 0; monthIndex <= currentMonth; monthIndex++) {
      const monthTransactions = allTransactions.filter((tx: Transaction) => {
        const txDate = new Date(tx.timestamp);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === monthIndex;
      });

      // Skip months with no transactions unless using mock data
      if (monthTransactions.length === 0 && !isUsingMockData) {
        continue;
      }

      const totalVolume = monthTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const averageAmount = monthTransactions.length > 0 ? totalVolume / monthTransactions.length : 0;

      // Calculate trend compared to previous month
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let changePercentage = 0;

      if (stats.length > 0) {
        const prevAverage = stats[stats.length - 1].averageAmount;
        if (prevAverage > 0) {
          changePercentage = ((averageAmount - prevAverage) / prevAverage) * 100;
          if (changePercentage > 2) trend = 'up';
          else if (changePercentage < -2) trend = 'down';
          else trend = 'stable';
        }
      }

      stats.push({
        month: months[monthIndex],
        monthNumber: monthIndex + 1,
        averageAmount,
        totalTransactions: monthTransactions.length,
        totalVolume,
        trend,
        changePercentage
      });
    }

    return stats;
  }, [allTransactions, isUsingMockData]);

  const overallStats = useMemo(() => {
    const totalTransactions = allTransactions.length;
    const totalVolume = allTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const overallAverage = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

    // Calculate month-over-month growth
    const lastMonth = monthlyStats[monthlyStats.length - 1];
    const secondLastMonth = monthlyStats[monthlyStats.length - 2];
    
    let monthOverMonthGrowth = 0;
    if (secondLastMonth && lastMonth && secondLastMonth.averageAmount > 0) {
      monthOverMonthGrowth = ((lastMonth.averageAmount - secondLastMonth.averageAmount) / secondLastMonth.averageAmount) * 100;
    }

    return {
      totalTransactions,
      totalVolume,
      overallAverage,
      monthOverMonthGrowth
    };
  }, [allTransactions, monthlyStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6 m-6">
      {/* Data Source Notice */}
      <Card className={`border-2 ${isUsingMockData ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className={`h-5 w-5 ${isUsingMockData ? 'text-blue-600' : 'text-green-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isUsingMockData ? 'text-blue-900' : 'text-green-900'}`}>
                  {isUsingMockData ? 'Demo Mode - Showing Sample Data' : 'Live Data - Real Transaction Analytics'}
                </p>
                <p className={`text-xs mt-1 ${isUsingMockData ? 'text-blue-700' : 'text-green-700'}`}>
                  {isUsingMockData 
                    ? 'This page shows transaction analytics and trends. Connect your backend to see real data.'
                    : `Last updated: ${lastFetchTime?.toLocaleTimeString() || 'Just now'}`
                  }
                </p>
                {error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {error}
                  </p>
                )}
              </div>
            </div>
            
            {!isUsingMockData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading transaction data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {isUsingMockData ? 'Sample data' : 'This year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              {isUsingMockData ? 'Sample data' : 'This year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.overallAverage)}</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Month-over-Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              overallStats.monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallStats.monthOverMonthGrowth >= 0 ? 
                <TrendingUp className="h-5 w-5" /> : 
                <TrendingDown className="h-5 w-5" />
              }
              {formatPercentage(overallStats.monthOverMonthGrowth)}
            </div>
            <p className="text-xs text-muted-foreground">Average transaction growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Show empty state if no data */}
      {!isLoading && monthlyStats.length === 0 && !isUsingMockData && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Transaction Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No transactions found for analysis. Start using your wallet to see statistics.
              </p>
              <Button onClick={handleRefresh} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts - only show if we have data */}
      {monthlyStats.length > 0 && (
        <>
          {/* Average Transaction Amount Chart with Transaction Count */}
          <Card>
            <CardHeader>
              <CardTitle>Average Transaction Amount & Count by Month</CardTitle>
              <CardDescription>
                Monthly average transaction amounts and total transaction count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'averageAmount') {
                          return [formatCurrency(value), 'Average Amount'];
                        }
                        return [value.toLocaleString(), 'Transaction Count'];
                      }}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="totalTransactions" 
                      fill="#e5e7eb"
                      radius={[2, 2, 0, 0]}
                      name="totalTransactions"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="averageAmount" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="averageAmount"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Count Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Transaction Count</CardTitle>
              <CardDescription>
                Number of transactions processed each month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar 
                      dataKey="totalTransactions" 
                      fill="#10b981"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Transaction Volume</CardTitle>
              <CardDescription>
                Total transaction volume by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Total Volume']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar 
                      dataKey="totalVolume" 
                      fill="#3b82f6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of transaction patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((stat, index) => (
                  <div key={stat.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-medium">{stat.month}</div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {stat.totalTransactions} transactions
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(stat.averageAmount)}</div>
                        <div className="text-sm text-muted-foreground">avg amount</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(stat.totalVolume)}</div>
                        <div className="text-sm text-muted-foreground">total volume</div>
                      </div>
                      
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          {getTrendIcon(stat.trend)}
                          <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                            {formatPercentage(stat.changePercentage)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TransactionStatistics;