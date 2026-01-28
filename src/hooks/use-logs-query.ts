'use client';

import { useQuery } from '@tanstack/react-query';
import { AdRequest } from '@/types/request';
import { AdEvent } from '@/types/event';

interface RequestFilters {
  status?: string;
  platform?: string;
}

interface EventFilters {
  eventType?: string;
  requestId?: string;
}

async function fetchRequestLogs(
  appId: string,
  filters: RequestFilters
): Promise<AdRequest[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.platform) params.set('platform', filters.platform);

  const response = await fetch(
    `/api/dashboard/apps/${appId}/logs/requests?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch request logs');
  }

  const data = await response.json();
  return data.requests;
}

async function fetchEventLogs(
  appId: string,
  filters: EventFilters
): Promise<AdEvent[]> {
  const params = new URLSearchParams();
  if (filters.eventType) params.set('eventType', filters.eventType);
  if (filters.requestId) params.set('requestId', filters.requestId);

  const response = await fetch(
    `/api/dashboard/apps/${appId}/logs/events?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch event logs');
  }

  const data = await response.json();
  return data.events;
}

export function useRequestLogsQuery(appId: string, filters: RequestFilters) {
  return useQuery({
    queryKey: ['requestLogs', appId, filters],
    queryFn: () => fetchRequestLogs(appId, filters),
    enabled: !!appId,
    // Keep data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useEventLogsQuery(appId: string, filters: EventFilters) {
  return useQuery({
    queryKey: ['eventLogs', appId, filters],
    queryFn: () => fetchEventLogs(appId, filters),
    enabled: !!appId,
    // Keep data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
