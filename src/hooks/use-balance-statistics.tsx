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

  /**
   * Fetch balance statistics from the API
   */
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

  /**
   * Load balance statistics
   */
  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        const apiData = await fetchStatistics();
        setStatisticsData(apiData);
        setIsFromAPI(true);
        
        toast({
          title: "Statistics Loaded",
          description: "Successfully loaded latest balance statistics from backend.",
        });
      } else {
        setStatisticsData(null);
        setIsFromAPI(false);
        setError(null);
      }
    } catch (error: any) {
      setStatisticsData(null);
      setIsFromAPI(false);
      
      toast({
        title: "loadStatistics Error",
        description: "Backend connection failed.",
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