'use client';

import { useQuery } from '@tanstack/react-query';
import { Organization } from '@/types/organization';

async function fetchOrganizations(): Promise<Organization[]> {
  const response = await fetch('/api/dashboard/organizations');

  if (!response.ok) {
    throw new Error('Failed to fetch organizations');
  }

  const data = await response.json();
  return data.organizations;
}

export function useOrganizationsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    enabled,
    // Keep data fresh for 30 minutes - won't refetch on navigation
    staleTime: 1000 * 60 * 30,
    // Cache for 1 hour
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
