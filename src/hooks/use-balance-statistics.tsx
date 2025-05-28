import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

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

interface OverallStats {
  totalUsers: number;
  currentTotalBalance: number;
  currentAverageBalance: number;
  avgMonthOverMonthGrowth: number;
  totalMonthOverMonthGrowth: number;
  userMonthOverMonthGrowth: number;
  totalNewUsersThisYear: number;
}

interface BalanceStatisticsData {
  monthlyStats: MonthlyBalanceStats[];
  overallStats: OverallStats;
  lastUpdated: string;
}

// Mock data generator (consistent pattern)
const generateMockBalanceData = (): BalanceStatisticsData => {
  const currentMonth = new Date().getMonth();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyStats: MonthlyBalanceStats[] = [];
  let cumulativeUsers = 50;

  for (let monthIndex = 0; monthIndex <= currentMonth; monthIndex++) {
    const newUsers = Math.floor(Math.random() * 15) + 5;
    cumulativeUsers += newUsers;
    
    const averageBalance = 3000 + (Math.random() * 2000) + (monthIndex * 200);
    const totalBalance = averageBalance * cumulativeUsers;
    
    // Calculate trends
    let avgTrend: 'up' | 'down' | 'stable' = 'stable';
    let totalTrend: 'up' | 'down' | 'stable' = 'up';
    let userTrend: 'up' | 'down' | 'stable' = 'up';
    let avgChangePercentage = 0;
    let totalChangePercentage = 0;
    let userChangePercentage = 0;

    if (monthIndex > 0) {
      const prevStats = monthlyStats[monthIndex - 1];
      avgChangePercentage = ((averageBalance - prevStats.averageBalance) / prevStats.averageBalance) * 100;
      totalChangePercentage = ((totalBalance - prevStats.totalBalance) / prevStats.totalBalance) * 100;
      userChangePercentage = ((cumulativeUsers - prevStats.userCount) / prevStats.userCount) * 100;
      
      avgTrend = avgChangePercentage > 2 ? 'up' : avgChangePercentage < -2 ? 'down' : 'stable';
      totalTrend = totalChangePercentage > 2 ? 'up' : totalChangePercentage < -2 ? 'down' : 'stable';
      userTrend = userChangePercentage > 0 ? 'up' : userChangePercentage < 0 ? 'down' : 'stable';
    }

    monthlyStats.push({
      month: months[monthIndex],
      monthNumber: monthIndex + 1,
      averageBalance,
      totalBalance,
      userCount: cumulativeUsers,
      avgTrend,
      totalTrend,
      userTrend,
      avgChangePercentage,
      totalChangePercentage,
      userChangePercentage,
      newUsers
    });
  }

  const currentStats = monthlyStats[monthlyStats.length - 1];
  const previousStats = monthlyStats[monthlyStats.length - 2];

  const overallStats: OverallStats = {
    totalUsers: currentStats.userCount,
    currentTotalBalance: currentStats.totalBalance,
    currentAverageBalance: currentStats.averageBalance,
    avgMonthOverMonthGrowth: previousStats ? ((currentStats.averageBalance - previousStats.averageBalance) / previousStats.averageBalance) * 100 : 0,
    totalMonthOverMonthGrowth: previousStats ? ((currentStats.totalBalance - previousStats.totalBalance) / previousStats.totalBalance) * 100 : 0,
    userMonthOverMonthGrowth: previousStats ? ((currentStats.userCount - previousStats.userCount) / previousStats.userCount) * 100 : 0,
    totalNewUsersThisYear: monthlyStats.reduce((sum, stat) => sum + stat.newUsers, 0)
  };

  return {
    monthlyStats,
    overallStats,
    lastUpdated: new Date().toISOString()
  };
};

// Standardized error handling
const handleAPIError = (error: any): string => {
  if (error.response?.status === 404) return 'Statistics endpoint not found';
  if (error.response?.status === 403) return 'Insufficient permissions to access statistics';
  if (error.response?.status >= 500) return 'Server error occurred while fetching statistics';
  if (!error.response) return 'Network error - unable to connect to backend';
  return error.message || 'Failed to load balance statistics from backend';
};

export const useBalanceStatistics = () => {
  const { isAuthenticated } = useAuth();
  const [statisticsData, setStatisticsData] = useState<BalanceStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromAPI, setIsFromAPI] = useState(false);
  const { toast } = useToast();

  // Fetch statistics from API
  const fetchStatistics = useCallback(async (): Promise<BalanceStatisticsData> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const response = await adminService.getBalanceStatistics();
      return response;
    } catch (error: any) {
      console.error('Error fetching balance statistics:', error);
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
      throw error;
    }
  }, [isAuthenticated]);

  // Load statistics (with fallback to mock data)
  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Try to fetch from API first
        const apiData = await fetchStatistics();
        setStatisticsData(apiData);
        setIsFromAPI(true);
        
        toast({
          title: "Statistics Loaded",
          description: "Successfully loaded latest balance statistics from backend.",
        });
      } else {
        // Use mock data if not authenticated
        const mockData = generateMockBalanceData();
        setStatisticsData(mockData);
        setIsFromAPI(false);
        setError(null);
      }
    } catch (error: any) {
      // Fallback to mock data if API fails
      console.warn('API failed, falling back to mock data:', error);
      const mockData = generateMockBalanceData();
      setStatisticsData(mockData);
      setIsFromAPI(false);
      
      // Show toast for API failure
      toast({
        title: "Using Demo Data",
        description: "Backend connection failed. Showing mock balance statistics.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatistics, isAuthenticated, toast]);

  // Refresh statistics
  const refreshStatistics = useCallback(async () => {
    await loadStatistics();
  }, [loadStatistics]);

  // Initial load
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    statisticsData,
    isLoading,
    error,
    isFromAPI,
    refreshStatistics,
    loadStatistics
  };
};