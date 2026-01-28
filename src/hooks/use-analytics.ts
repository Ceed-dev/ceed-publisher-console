'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsMetrics, TimeRange } from '@/types/analytics';

interface UseAnalyticsOptions {
  appId: string;
  timeRange: TimeRange;
}

interface UseAnalyticsResult {
  metrics: AnalyticsMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics({ appId, timeRange }: UseAnalyticsOptions): UseAnalyticsResult {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!appId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: timeRange.startDate.toISOString(),
        endDate: timeRange.endDate.toISOString(),
      });

      const response = await fetch(
        `/api/dashboard/apps/${appId}/analytics?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [appId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { metrics, loading, error, refetch: fetchAnalytics };
}
