import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { statisticsService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { MonthlyData, FinancialData } from '@/types/payment';

interface StatisticsData {
  financialData: FinancialData;
  getChartData: () => MonthlyData[];
  isFromAPI: boolean;
  isLoading?: boolean,
  error?: string,
  refreshStatistics?: () => Promise<void>,
  loadStatistics?: () => Promise<void>
}

export const useStatistics = (): StatisticsData => {
  const { isAuthenticated, user } = useAuth();
  const [statisticsData, setStatisticsData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromAPI, setIsFromAPI] = useState(false);
  const { toast } = useToast();

  // Fetch statistics from API
  const fetchStatistics = useCallback(async (): Promise<MonthlyData[]> => {
    if (!isAuthenticated || !user?.isVerified) {
      throw new Error('User not authenticated or not verified');
    }
    setIsLoading(true);

    try {
      setError(null);
      const response = await statisticsService.getStatistics();

      setStatisticsData(response);
      setIsFromAPI(true);
      return response;
    } catch (error: any) {
      console.error('Error fetching transaction statistics:', error);
      setIsFromAPI(false);
      setStatisticsData(null);

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

  // Load statistics
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
        setStatisticsData(null);
        setIsFromAPI(false);
        setError(null);
      }
    } catch (error: any) {
      setStatisticsData(null);
      setIsFromAPI(false);
      
      // Show toast for API failure
      toast({
        title: "Using Demo Data",
        description: "Backend connection failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh statistics
  const refreshStatistics = useCallback(async () => {
    await loadStatistics();
  }, [loadStatistics]);

  const getFilteredCurrencyData = (): MonthlyData[] => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    return statisticsData.slice(0, currentMonth + 1).map(month => ({
      ...month,
      revenue: month.received - month.sent
    }));
  };

  const correctedCurrencyData: MonthlyData[] = getFilteredCurrencyData();

  const totalReceived = correctedCurrencyData.reduce((sum, month) => sum + month.received, 0);
  const totalSent = correctedCurrencyData.reduce((sum, month) => sum + month.sent, 0);

  const financialData: FinancialData = {
    revenue: totalReceived - totalSent, // FIXED: revenue = received - sent
    sent: totalSent,
    received: totalReceived,
  };

  const getChartData = () => {
    return correctedCurrencyData;
  };

  useEffect(() => {
    if(isAuthenticated && user?.isVerified) {
      fetchStatistics();
    }
  }, [isAuthenticated, user?.isVerified]);

  const result = {
    financialData,
    getChartData,
    isFromAPI,
    isLoading,
    error,
    refreshStatistics,
    loadStatistics
  };

  return result;
};