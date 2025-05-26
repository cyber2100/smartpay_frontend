import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Wallet, UserPlus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

// Mock data structure - replace with your actual data hooks
interface UserBalance {
  userId: string;
  balances: {
    month: number;
    year: number;
    endOfMonthBalance: number;
  }[];
}

interface MonthlyBalanceStats {
  month: string;
  monthNumber: number;
  averageBalance: number;
  totalBalance: number;
  userCount: number;
  avgTrend: 'up' | 'down' | 'stable';
  totalTrend: 'up' | 'down' | 'stable';
  userTrend: 'up' | 'down' | 'stable';
  avgChangePercentage: number;
  totalChangePercentage: number;
  userChangePercentage: number;
  newUsers: number;
}

const BalanceStatistics: React.FC = () => {
  // Mock data - replace with your actual data hook
  const userBalances: UserBalance[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Generate mock data with realistic user growth patterns
    const mockUsers = Array.from({ length: 120 }, (_, i) => {
      // Simulate users joining at different times throughout the year
      const userJoinMonth = Math.floor(Math.random() * (currentMonth + 1));
      
      return {
        userId: `user_${i + 1}`,
        balances: Array.from({ length: currentMonth + 1 }, (_, monthIndex) => {
          // Only include balances for months after the user joined
          if (monthIndex >= userJoinMonth) {
            return {
              month: monthIndex,
              year: currentYear,
              endOfMonthBalance: Math.random() * 8000 + 2000 + ((monthIndex - userJoinMonth) * 150) // Growing trend from join date
            };
          }
          return null;
        }).filter(Boolean) as { month: number; year: number; endOfMonthBalance: number; }[]
      };
    });
    
    return mockUsers;
  }, []);

  const monthlyStats: MonthlyBalanceStats[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const stats: MonthlyBalanceStats[] = [];

    // Process each month from January to current month
    for (let monthIndex = 0; monthIndex <= currentMonth; monthIndex++) {
      // Get users who have balances for this month (i.e., users who had joined by this month)
      const usersWithBalancesThisMonth = userBalances.filter(user => 
        user.balances.some(b => b.month === monthIndex && b.year === currentYear)
      );

      const monthlyUserBalances = usersWithBalancesThisMonth.map(user => 
        user.balances.find(b => b.month === monthIndex && b.year === currentYear)?.endOfMonthBalance || 0
      ).filter(balance => balance > 0);

      const totalBalance = monthlyUserBalances.reduce((sum, balance) => sum + balance, 0);
      const averageBalance = monthlyUserBalances.length > 0 ? totalBalance / monthlyUserBalances.length : 0;
      const userCount = usersWithBalancesThisMonth.length;

      // Calculate new users (users who joined this month)
      const newUsers = monthIndex === 0 ? userCount : userCount - (stats[monthIndex - 1]?.userCount || 0);

      // Calculate trends compared to previous month
      let avgTrend: 'up' | 'down' | 'stable' = 'stable';
      let totalTrend: 'up' | 'down' | 'stable' = 'stable';
      let userTrend: 'up' | 'down' | 'stable' = 'stable';
      let avgChangePercentage = 0;
      let totalChangePercentage = 0;
      let userChangePercentage = 0;

      if (monthIndex > 0 && stats[monthIndex - 1]) {
        const prevAvgBalance = stats[monthIndex - 1].averageBalance;
        const prevTotalBalance = stats[monthIndex - 1].totalBalance;
        const prevUserCount = stats[monthIndex - 1].userCount;
        
        // Average balance trend
        if (prevAvgBalance > 0) {
          avgChangePercentage = ((averageBalance - prevAvgBalance) / prevAvgBalance) * 100;
          if (avgChangePercentage > 2) avgTrend = 'up';
          else if (avgChangePercentage < -2) avgTrend = 'down';
          else avgTrend = 'stable';
        }

        // Total balance trend
        if (prevTotalBalance > 0) {
          totalChangePercentage = ((totalBalance - prevTotalBalance) / prevTotalBalance) * 100;
          if (totalChangePercentage > 2) totalTrend = 'up';
          else if (totalChangePercentage < -2) totalTrend = 'down';
          else totalTrend = 'stable';
        }

        // User count trend
        if (prevUserCount > 0) {
          userChangePercentage = ((userCount - prevUserCount) / prevUserCount) * 100;
          if (userChangePercentage > 0) userTrend = 'up';
          else if (userChangePercentage < 0) userTrend = 'down';
          else userTrend = 'stable';
        }
      }

      stats.push({
        month: months[monthIndex],
        monthNumber: monthIndex + 1,
        averageBalance,
        totalBalance,
        userCount,
        avgTrend,
        totalTrend,
        userTrend,
        avgChangePercentage,
        totalChangePercentage,
        userChangePercentage,
        newUsers
      });
    }

    return stats;
  }, [userBalances]);

  const overallStats = useMemo(() => {
    const currentMonthStats = monthlyStats[monthlyStats.length - 1];
    const previousMonthStats = monthlyStats[monthlyStats.length - 2];
    
    const totalUsers = currentMonthStats?.userCount || 0;
    const currentTotalBalance = currentMonthStats?.totalBalance || 0;
    const currentAverageBalance = currentMonthStats?.averageBalance || 0;
    const totalNewUsersThisYear = monthlyStats.reduce((sum, stat) => sum + stat.newUsers, 0);

    // Calculate month-over-month growth
    let avgMonthOverMonthGrowth = 0;
    let totalMonthOverMonthGrowth = 0;
    let userMonthOverMonthGrowth = 0;
    
    if (previousMonthStats && currentMonthStats) {
      if (previousMonthStats.averageBalance > 0) {
        avgMonthOverMonthGrowth = ((currentMonthStats.averageBalance - previousMonthStats.averageBalance) / previousMonthStats.averageBalance) * 100;
      }
      if (previousMonthStats.totalBalance > 0) {
        totalMonthOverMonthGrowth = ((currentMonthStats.totalBalance - previousMonthStats.totalBalance) / previousMonthStats.totalBalance) * 100;
      }
      if (previousMonthStats.userCount > 0) {
        userMonthOverMonthGrowth = ((currentMonthStats.userCount - previousMonthStats.userCount) / previousMonthStats.userCount) * 100;
      }
    }

    return {
      totalUsers,
      currentTotalBalance,
      currentAverageBalance,
      avgMonthOverMonthGrowth,
      totalMonthOverMonthGrowth,
      userMonthOverMonthGrowth,
      totalNewUsersThisYear
    };
  }, [userBalances, monthlyStats]);

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

      {/* User Growth and Balance Combined Chart */}
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  yAxisId="balance"
                  orientation="left"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <YAxis 
                  yAxisId="users"
                  orientation="right"
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'User Count') {
                      return [value.toLocaleString(), name];
                    }
                    return [formatCurrency(value), name];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  yAxisId="balance"
                  dataKey="averageBalance" 
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                  name="Average Balance"
                />
                <Line 
                  yAxisId="users"
                  type="monotone" 
                  dataKey="userCount" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="User Count"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Total Balance Chart */}
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Total Balance']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalBalance" 
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
                      <Badge variant="secondary" className="text-xs">
                        +{stat.newUsers} new
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(stat.averageBalance)}</div>
                    <div className="text-sm text-muted-foreground">avg balance</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(stat.totalBalance)}</div>
                    <div className="text-sm text-muted-foreground">total balance</div>
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