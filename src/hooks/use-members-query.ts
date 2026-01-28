'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrganizationMember } from '@/types/member';

async function fetchMembers(orgId: string): Promise<OrganizationMember[]> {
  const response = await fetch(`/api/dashboard/members?orgId=${orgId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }

  const data = await response.json();
  return data.members;
}

export function useMembersQuery(orgId: string | undefined) {
  return useQuery({
    queryKey: ['members', orgId],
    queryFn: () => fetchMembers(orgId!),
    enabled: !!orgId,
    // Keep data fresh for 30 minutes
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useInvalidateMembers() {
  const queryClient = useQueryClient();

  return {
    invalidateMembers: (orgId?: string) => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['members'] });
      }
    },
  };
}
