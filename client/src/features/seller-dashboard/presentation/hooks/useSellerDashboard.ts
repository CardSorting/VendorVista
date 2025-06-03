/**
 * Seller Dashboard Hook - Custom hook implementing Clean Architecture
 * Follows Apple's principle of intuitive, responsive user experience
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetSellerDashboardQuery, SellerDashboardData } from '../../application/queries/GetSellerDashboardQuery';
import { GetSellerDashboardHandler } from '../../application/handlers/GetSellerDashboardHandler';
import { ApiSellerRepository, ApiSellerAnalyticsRepository } from '../../infrastructure/adapters/ApiSellerRepository';

export type TimeframeOption = 'day' | 'week' | 'month' | 'year';

export interface UseSellerDashboardOptions {
  sellerId: string;
  initialTimeframe?: TimeframeOption;
  enabled?: boolean;
}

export interface UseSellerDashboardResult {
  data: SellerDashboardData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  timeframe: TimeframeOption;
  setTimeframe: (timeframe: TimeframeOption) => void;
  refetch: () => void;
}

export function useSellerDashboard({
  sellerId,
  initialTimeframe = 'week',
  enabled = true
}: UseSellerDashboardOptions): UseSellerDashboardResult {
  const [timeframe, setTimeframe] = useState<TimeframeOption>(initialTimeframe);

  // Initialize handlers with dependency injection
  const handler = useMemo(() => {
    const sellerRepository = new ApiSellerRepository();
    const analyticsRepository = new ApiSellerAnalyticsRepository();
    return new GetSellerDashboardHandler(sellerRepository, analyticsRepository);
  }, []);

  const query: GetSellerDashboardQuery = useMemo(() => ({
    sellerId,
    timeframe
  }), [sellerId, timeframe]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['seller-dashboard', sellerId, timeframe],
    queryFn: () => handler.handle(query),
    enabled: enabled && Boolean(sellerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Apple-style graceful error handling
      if (error instanceof Error && error.message.includes('not found')) {
        return false; // Don't retry for 404s
      }
      return failureCount < 3;
    }
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    timeframe,
    setTimeframe,
    refetch
  };
}