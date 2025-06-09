/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

interface MonthlyStats {
  month: string;
  monthNumber: number;
  averageAmount: number;
  totalTransactions: number;
  totalVolume: number;
  trend: "up" | "down" | "stable";
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
 * Custom hook to fetch and manage transaction statistics.
 * @returns {Object} Hook state and actions.
 */
export const useTransactionStatistics = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [statisticsData, setStatisticsData] =
    useState<TransactionStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromAPI, setIsFromAPI] = useState(false);
  const { toast } = useToast();

  // Fetch statistics from API
  const fetchStatistics =
    useCallback(async (): Promise<TransactionStatisticsData> => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      setIsLoading(true);

      try {
        setError(null);
        const response = await adminService.getTransactionStatistics();

        setStatisticsData(response);
        setIsFromAPI(true);
        return response;
      } catch (error: any) {
        console.error("Error fetching transaction statistics:", error);
        setIsFromAPI(false);

        let errorMessage = "Failed to load transaction statistics from backend";
        if (error.response?.status === 404) {
          errorMessage = "Statistics endpoint not found";
        } else if (error.response?.status === 403) {
          errorMessage = "Insufficient permissions to access statistics";
        } else if (error.response?.status >= 500) {
          errorMessage = "Server error occurred while fetching statistics";
        } else if (!error.response) {
          errorMessage = "Network error - unable to connect to backend";
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
        const apiData = await fetchStatistics();
        setStatisticsData(apiData);
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

  return {
    statisticsData,
    isLoading,
    error,
    isFromAPI,
    refreshStatistics,
    loadStatistics,
  };
};
