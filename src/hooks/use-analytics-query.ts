'use client';

import { useQuery } from '@tanstack/react-query';
import { AnalyticsMetrics, TimeRange } from '@/types/analytics';

interface UseAnalyticsQueryOptions {
  appId: string;
  timeRange: TimeRange;
}

async function fetchAnalytics(
  appId: string,
  timeRange: TimeRange
): Promise<AnalyticsMetrics> {
  const params = new URLSearchParams({
    startDate: timeRange.startDate.toISOString(),
    endDate: timeRange.endDate.toISOString(),
  });

  const response = await fetch(`/api/dashboard/apps/${appId}/analytics?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  const data = await response.json();
  return data.metrics;
}

export function useAnalyticsQuery({ appId, timeRange }: UseAnalyticsQueryOptions) {
  return useQuery({
    queryKey: [
      'analytics',
      appId,
      timeRange.startDate.toISOString(),
      timeRange.endDate.toISOString(),
    ],
    queryFn: () => fetchAnalytics(appId, timeRange),
    enabled: !!appId,
    // Keep data fresh for 30 minutes
    staleTime: 1000 * 60 * 30,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
  });
}
