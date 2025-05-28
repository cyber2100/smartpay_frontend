import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Wallet, UserPlus, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBalanceStatistics } from '@/hooks/use-balance-statistics';

const BalanceStatistics: React.FC = () => {
  const { error, isLoading, statisticsData, isFromAPI, refreshStatistics } = useBalanceStatistics();

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
              <p className="text-muted-foreground">Loading balance statistics...</p>
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
                Unable to load balance statistics data.
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
                    Balance statistics loaded from backend server.
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
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalUsers.toLocaleString()}</div>
            <div className={`text-sm flex items-center gap-1 ${
              overallStats.userMonthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallStats.userMonthOverMonthGrowth >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {formatPercentage(overallStats.userMonthOverMonthGrowth)} MoM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.currentTotalBalance)}</div>
            <div className={`text-sm flex items-center gap-1 ${
              overallStats.totalMonthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallStats.totalMonthOverMonthGrowth >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {formatPercentage(overallStats.totalMonthOverMonthGrowth)} MoM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Average Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.currentAverageBalance)}</div>
            <div className={`text-sm flex items-center gap-1 ${
              overallStats.avgMonthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallStats.avgMonthOverMonthGrowth >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {formatPercentage(overallStats.avgMonthOverMonthGrowth)} MoM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              New Users YTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.totalNewUsersThisYear.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Users added this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Combined Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth & Average Balance Trends</CardTitle>
          <CardDescription>
            Monthly user count growth alongside average balance per user
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
                  yAxisId="balance"
                  orientation="left"
                  stroke="#3b82f6"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <YAxis 
                  yAxisId="users"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'averageBalance') {
                      return [formatCurrency(value), 'Average Balance'];
                    }
                    return [value.toLocaleString(), 'User Count'];
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
                  yAxisId="balance"
                  type="monotone" 
                  dataKey="averageBalance" 
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
                  name="averageBalance"
                />
                <Line 
                  yAxisId="users"
                  type="monotone" 
                  dataKey="userCount" 
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
                  name="userCount"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500 rounded"></div>
              <span className="text-blue-600 font-medium">Average Balance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500 rounded border-2 border-dashed border-green-500"></div>
              <span className="text-green-600 font-medium">User Count</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Line Charts in a Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly User Count</CardTitle>
            <CardDescription>
              Number of active users each month
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
                    formatter={(value: number) => [value.toLocaleString(), 'Users']}
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
                    dataKey="userCount" 
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

        <Card>
          <CardHeader>
            <CardTitle>Total Platform Balance by Month</CardTitle>
            <CardDescription>
              Combined balance of all users showing platform growth
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
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Total Balance']}
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
                    dataKey="totalBalance" 
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
          <CardTitle>Monthly Balance & User Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of balance trends, user growth, and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((stat, index) => (
              <div key={stat.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium">{stat.month}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {stat.userCount.toLocaleString()} users
                    </div>
                    {stat.newUsers > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{stat.newUsers} new
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col min-[1100px]:flex-row min-[1100px]:items-center gap-6">
                  <div className='flex justify-end'>
                    <div className="text-right mr-2">
                      <div className="font-medium">{formatCurrency(stat.averageBalance)}</div>
                      <div className="text-sm text-muted-foreground">avg balance</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(stat.totalBalance)}</div>
                      <div className="text-sm text-muted-foreground">total balance</div>
                    </div>
                  </div>
                  
                  {index > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(stat.avgTrend)}
                        <span className={`text-sm font-medium ${getTrendColor(stat.avgTrend)}`}>
                          {formatPercentage(stat.avgChangePercentage)}
                        </span>
                        <span className="text-xs text-muted-foreground">avg</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getTrendIcon(stat.totalTrend)}
                        <span className={`text-sm font-medium ${getTrendColor(stat.totalTrend)}`}>
                          {formatPercentage(stat.totalChangePercentage)}
                        </span>
                        <span className="text-xs text-muted-foreground">total</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getTrendIcon(stat.userTrend)}
                        <span className={`text-sm font-medium ${getTrendColor(stat.userTrend)}`}>
                          {formatPercentage(stat.userChangePercentage)}
                        </span>
                        <span className="text-xs text-muted-foreground">users</span>
                      </div>
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

export default BalanceStatistics;