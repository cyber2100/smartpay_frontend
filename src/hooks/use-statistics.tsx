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

const mockCurrencyData: MonthlyData[] = [
  { name: 'Jan', received: 2000, sent: 1200 },
  { name: 'Feb', received: 3200, sent: 1300 },
  { name: 'Mar', received: 2800, sent: 1400 },
  { name: 'Apr', received: 4500, sent: 2300 },
  { name: 'May', received: 3800, sent: 1700 },
  { name: 'Jun', received: 6200, sent: 2800 },
  { name: 'Jul', received: 5800, sent: 2500 },
  { name: 'Aug', received: 5200, sent: 2400 },
  { name: 'Sep', received: 6100, sent: 2800 },
  { name: 'Oct', received: 7200, sent: 3000 },
  { name: 'Nov', received: 6800, sent: 3000 },
  { name: 'Dec', received: 8500, sent: 3900 }
];

export const useStatistics = (): StatisticsData => {
  const { isAuthenticated } = useAuth();
  const [statisticsData, setStatisticsData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromAPI, setIsFromAPI] = useState(false);
  const { toast } = useToast();

  // Fetch statistics from API
  const fetchStatistics = useCallback(async (): Promise<MonthlyData[]> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
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
      setStatisticsData(mockCurrencyData);
      
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
        setStatisticsData(mockCurrencyData);
        setIsFromAPI(false);
        setError(null);
      }
    } catch (error: any) {
      // Fallback to mock data if API fails
      console.warn('API failed, falling back to mock data:', error);
      setStatisticsData(mockCurrencyData);
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
    if(isAuthenticated) {
      fetchStatistics();
    }
  }, []);

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