import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useWallet } from '@/hooks/use-wallet';
import { Transaction } from '@/types/payment';

interface MonthlyStats {
  month: string;
  monthNumber: number;
  averageAmount: number;
  totalTransactions: number;
  totalVolume: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

const TransactionStatistics: React.FC = () => {
  const { allTransactions } = useWallet();

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

      const totalVolume = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const averageAmount = monthTransactions.length > 0 ? totalVolume / monthTransactions.length : 0;

      // Calculate trend compared to previous month
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let changePercentage = 0;

      if (monthIndex > 0 && stats[monthIndex - 1]) {
        const prevAverage = stats[monthIndex - 1].averageAmount;
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
  }, [allTransactions]);

  const overallStats = useMemo(() => {
    const totalTransactions = allTransactions.length;
    const totalVolume = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
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
            <p className="text-xs text-muted-foreground">This year</p>
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
            <p className="text-xs text-muted-foreground">This year</p>
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

      {/* Average Transaction Amount Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Average Transaction Amount by Month</CardTitle>
          <CardDescription>
            Monthly average transaction amounts showing trends throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Average Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageAmount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Transaction Volume</CardTitle>
          <CardDescription>
            Total transaction volume and count by month
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
                  <div className="text-sm text-muted-foreground">
                    {stat.totalTransactions} transactions
                  </div>
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
    </div>
  );
};

export default TransactionStatistics;