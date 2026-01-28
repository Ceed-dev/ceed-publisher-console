'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { App } from '@/types/app';

async function fetchApps(orgId: string): Promise<App[]> {
  const response = await fetch(`/api/dashboard/apps?orgId=${orgId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch apps');
  }

  const data = await response.json();
  return data.apps;
}

async function fetchApp(appId: string): Promise<App> {
  const response = await fetch(`/api/dashboard/apps/${appId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch app');
  }

  const data = await response.json();
  return data.app;
}

export function useAppsQuery(orgId: string | undefined) {
  return useQuery({
    queryKey: ['apps', orgId],
    queryFn: () => fetchApps(orgId!),
    enabled: !!orgId,
    // Keep data fresh for 30 minutes
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useAppQuery(appId: string | undefined) {
  return useQuery({
    queryKey: ['app', appId],
    queryFn: () => fetchApp(appId!),
    enabled: !!appId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useInvalidateApps() {
  const queryClient = useQueryClient();

  return {
    invalidateApps: (orgId?: string) => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['apps', orgId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['apps'] });
      }
    },
    invalidateApp: (appId: string) => {
      queryClient.invalidateQueries({ queryKey: ['app', appId] });
    },
  };
}
