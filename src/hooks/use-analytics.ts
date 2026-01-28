'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyticsMetrics, TimeRange } from '@/types/analytics';
import { getCached, setCache } from '@/lib/utils/cache';

interface UseAnalyticsOptions {
  appId: string;
  timeRange: TimeRange;
}

interface UseAnalyticsResult {
  metrics: AnalyticsMetrics | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics({ appId, timeRange }: UseAnalyticsOptions): UseAnalyticsResult {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchAnalytics = useCallback(async () => {
    if (!appId) return;

    const cacheKey = `analytics:${appId}:${timeRange.startDate.toISOString()}:${timeRange.endDate.toISOString()}`;

    // Check cache first
    const cached = getCached<{ metrics: AnalyticsMetrics }>(cacheKey, 30000);
    if (cached) {
      setMetrics(cached.metrics);
      setLoading(false);
      initialLoadDone.current = true;
      return;
    }

    // Only show loading spinner on initial load, show refreshing indicator otherwise
    if (!initialLoadDone.current && !metrics) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
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
      setCache(cacheKey, data);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      initialLoadDone.current = true;
    }
  }, [appId, timeRange, metrics]);

  useEffect(() => {
    fetchAnalytics();
  }, [appId, timeRange.startDate.getTime(), timeRange.endDate.getTime()]);

  return { metrics, loading, isRefreshing, error, refetch: fetchAnalytics };
}
