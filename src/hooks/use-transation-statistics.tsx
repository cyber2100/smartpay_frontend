import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

interface MonthlyStats {
  month: string;
  monthNumber: number;
  averageAmount: number;
  totalTransactions: number;
  totalVolume: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

interface OverallStats {
  totalTransactions: number;
  totalVolume: number;
  overallAverage: number;
  monthOverMonthGrowth: number;
}

interface TransactionStatisticsData {
  overallStats: OverallStats;
  monthlyStats: MonthlyStats[];
  lastUpdated: string;
  isFromAPI: boolean;
}

/**
 * Generate mock transaction statistics data.
 * @returns {TransactionStatisticsData} Mock transaction statistics data.
 */
const generateMockStatisticsData = (): TransactionStatisticsData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const monthlyStats: MonthlyStats[] = [];
  let totalTransactions = 0;
  let totalVolume = 0;

  for (let i = 0; i < 6; i++) {
    const transactionCount = Math.floor(Math.random() * 25) + 20;
    const avgAmount = 75 + (Math.random() * 50);
    const volume = transactionCount * avgAmount;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let changePercentage = 0;
    
    if (i > 0) {
      const prevAvg = monthlyStats[i - 1].averageAmount;
      changePercentage = ((avgAmount - prevAvg) / prevAvg) * 100;
      if (changePercentage > 5) trend = 'up';
      else if (changePercentage < -5) trend = 'down';
    }

    monthlyStats.push({
      month: months[i],
      monthNumber: i + 1,
      averageAmount: avgAmount,
      totalTransactions: transactionCount,
      totalVolume: volume,
      trend,
      changePercentage
    });

    totalTransactions += transactionCount;
    totalVolume += volume;
  }

  const overallAverage = totalVolume / totalTransactions;
  const lastTwoMonths = monthlyStats.slice(-2);
  const monthOverMonthGrowth = lastTwoMonths.length === 2 
    ? ((lastTwoMonths[1].averageAmount - lastTwoMonths[0].averageAmount) / lastTwoMonths[0].averageAmount) * 100
    : 0;

  return {
    overallStats: {
      totalTransactions,
      totalVolume,
      overallAverage,
      monthOverMonthGrowth
    },
    monthlyStats,
    lastUpdated: new Date().toISOString(),
    isFromAPI: false
  };
};

/**
 * Custom hook to fetch and manage transaction statistics.
 * @returns {Object} Hook state and actions.
 */
export const useTransactionStatistics = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [statisticsData, setStatisticsData] = useState<TransactionStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromAPI, setIsFromAPI] = useState(false);
  const { toast } = useToast();

  // Fetch statistics from API
  const fetchStatistics = useCallback(async (): Promise<TransactionStatisticsData> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    setIsLoading(true);

    try {
      setError(null);
      const response = await adminService.getTransactionStatistics();

      setStatisticsData(response);
      setIsFromAPI(true);
      return response;
    } catch (error: any) {
      console.error('Error fetching transaction statistics:', error);
      setIsFromAPI(false);
      
      let errorMessage = 'Failed to load transaction statistics from backend';
      if (error.response?.status === 404) {
        errorMessage = 'Statistics endpoint not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'Insufficient permissions to access statistics';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error occurred while fetching statistics';
      } else if (!error.response) {
        errorMessage = 'Network error - unable to connect to backend';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
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
        
        toast({
          title: "Statistics Loaded",
          description: "Successfully loaded latest transaction statistics from backend.",
        });
      } else {
        // Use mock data if not authenticated
        const mockData = generateMockStatisticsData();
        setStatisticsData(mockData);
        setIsFromAPI(false);
        setError(null);
      }
    } catch (error: any) {
      // Fallback to mock data if API fails
      console.warn('API failed, falling back to mock data:', error);
      const mockData = generateMockStatisticsData();
      setStatisticsData(mockData);
      setIsFromAPI(false);
      
      // Show toast for API failure
      toast({
        title: "Using Demo Data",
        description: "Backend connection failed. Showing mock transaction statistics.",
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

  useEffect(() => {
    if(isAdmin && isAuthenticated){
      fetchStatistics();
    }
  }, [isAdmin, isAuthenticated])

  return {
    statisticsData,
    isLoading,
    error,
    isFromAPI,
    refreshStatistics,
    loadStatistics
  };
};