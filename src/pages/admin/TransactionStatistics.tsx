import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTransactionStatistics } from '@/hooks/use-transation-statistics';

const TransactionStatistics: React.FC = () => {
  const { error, isLoading, statisticsData, isFromAPI, refreshStatistics } = useTransactionStatistics();

  const handleRefresh = () => {
    refreshStatistics();
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 m-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading transaction statistics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (shouldn't happen since we have fallback, but just in case)
  if (!statisticsData) {
    return (
      <div className="space-y-6 m-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="font-medium mb-2">Failed to Load Statistics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to load transaction statistics data.
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overallStats, monthlyStats } = statisticsData;

  return (
    <div className="space-y-6 m-6">
      {/* API Status Notice */}
      {!isFromAPI ? (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Using Demo Data:</strong> API connection failed. Showing mock statistics for demonstration.
                {error && <div className="text-xs mt-1 opacity-75">Error: {error}</div>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-4 gap-2 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="h-4 w-4" />
                Retry API
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Live Data - Connected to API
                  </p>
                  <p className="text-xs mt-1 text-green-700">
                    Statistics loaded from backend server.
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2 border-green-300 text-green-700 hover:bg-green-100"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
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
            <p className="text-xs text-muted-foreground">6-month period</p>
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
            <p className="text-xs text-muted-foreground">6-month period</p>
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

      {/* Enhanced Combined Chart */}
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
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
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
    </div>
  );
};

export default TransactionStatistics;