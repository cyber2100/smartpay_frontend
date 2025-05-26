import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Info, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

// Mock data generator
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const currentYear = new Date().getFullYear();
  const descriptions = ['Online Purchase', 'Coffee Shop', 'Gas Station', 'Grocery Store', 'Restaurant', 'Subscription', 'Transfer', 'ATM Withdrawal'];
  
  for (let month = 0; month < 6; month++) {
    const transactionCount = Math.floor(Math.random() * 20) + 15;
    
    for (let i = 0; i < transactionCount; i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const baseAmount = 50 + (month * 10);
      const amount = baseAmount + (Math.random() * 200) - 100;
      
      transactions.push({
        id: `mock-${month}-${i}`,
        amount: Math.max(amount, 5),
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
  // Mock state for demo purposes
  const [isAuthenticated] = useState(true);
  const [transactions] = useState(generateMockTransactions());
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime] = useState(new Date());
  const [error] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const allTransactions = useMemo(() => {
    if (transactions && transactions.length > 0) {
      return transactions.map(tx => ({
        ...tx,
        timestamp: typeof tx.timestamp === 'string' ? tx.timestamp : tx.timestamp.toISOString(),
        description: tx.description || `${tx.type} transaction`,
        amount: Math.abs(tx.amount)
      }));
    }
    return generateMockTransactions();
  }, [transactions]);

  const isUsingMockData = !isAuthenticated || !transactions || transactions.length === 0;

  const monthlyStats: MonthlyStats[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const stats: MonthlyStats[] = [];

    for (let monthIndex = 0; monthIndex <= currentMonth; monthIndex++) {
      const monthTransactions = allTransactions.filter((tx: Transaction) => {
        const txDate = new Date(tx.timestamp);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === monthIndex;
      });

      if (monthTransactions.length === 0 && !isUsingMockData) {
        continue;
      }

      const totalVolume = monthTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const averageAmount = monthTransactions.length > 0 ? totalVolume / monthTransactions.length : 0;

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
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Demo Mode - Showing Sample Data
                </p>
                <p className="text-xs mt-1 text-blue-700">
                  This page shows transaction analytics and trends. Connect your backend to see real data.
                </p>
              </div>
            </div>
            
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
            <p className="text-xs text-muted-foreground">Sample data</p>
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
            <p className="text-xs text-muted-foreground">Sample data</p>
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

      {/* Line Charts in Row */}
      {monthlyStats.length > 0 && (
        <>
          {/* Enhanced Combined Chart with Better Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Average Transaction Amount & Transaction Count</CardTitle>
              <CardDescription>
                Monthly trends showing both average amount and transaction count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#3b82f6"
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      stroke="#10b981"
                      fontSize={12}
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
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderWidth: '1px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="averageAmount" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      dot={{ 
                        fill: '#ffffff', 
                        stroke: '#3b82f6',
                        strokeWidth: 3, 
                        r: 6 
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: '#3b82f6',
                        stroke: '#ffffff',
                        strokeWidth: 2
                      }}
                      name="averageAmount"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="totalTransactions" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      strokeDasharray="8 4"
                      dot={{ 
                        fill: '#ffffff', 
                        stroke: '#10b981',
                        strokeWidth: 3, 
                        r: 6 
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: '#10b981',
                        stroke: '#ffffff',
                        strokeWidth: 2
                      }}
                      name="totalTransactions"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div>
                  <span className="text-blue-600 font-medium">Average Amount</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500 rounded border-2 border-dashed border-green-500"></div>
                  <span className="text-green-600 font-medium">Transaction Count</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Line Charts in a Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Count Line Chart */}
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
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderWidth: '1px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalTransactions" 
                        stroke="#10b981"
                        strokeWidth={4}
                        dot={{ 
                          fill: '#ffffff', 
                          stroke: '#10b981',
                          strokeWidth: 3, 
                          r: 6 
                        }}
                        activeDot={{ 
                          r: 8, 
                          fill: '#10b981',
                          stroke: '#ffffff',
                          strokeWidth: 2
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Volume Line Chart */}
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
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Total Volume']}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderWidth: '1px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalVolume" 
                        stroke="#3b82f6"
                        strokeWidth={4}
                        dot={{ 
                          fill: '#ffffff', 
                          stroke: '#3b82f6',
                          strokeWidth: 3, 
                          r: 6 
                        }}
                        activeDot={{ 
                          r: 8, 
                          fill: '#3b82f6',
                          stroke: '#ffffff',
                          strokeWidth: 2
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

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