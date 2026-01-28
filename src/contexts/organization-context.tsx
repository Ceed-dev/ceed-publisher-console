'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Organization } from '@/types/organization';
import { useAuth } from './auth-context';
import { useOrganizationsQuery } from '@/hooks/use-organizations-query';

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  loading: boolean;
  error: string | null;
  refetchOrganizations: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

const CURRENT_ORG_KEY = 'cpc_current_org_id';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: organizations = [],
    isLoading,
    error,
    refetch,
  } = useOrganizationsQuery(!!user);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Set initial org from localStorage or first org
  useEffect(() => {
    if (isLoading || initialized) return;

    if (!user) {
      setCurrentOrgState(null);
      setInitialized(true);
      return;
    }

    if (organizations.length > 0) {
      const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
      const savedOrg = organizations.find((org) => org.orgId === savedOrgId);

      if (savedOrg) {
        setCurrentOrgState(savedOrg);
      } else {
        setCurrentOrgState(organizations[0]);
        localStorage.setItem(CURRENT_ORG_KEY, organizations[0].orgId);
      }
      setInitialized(true);
    } else if (!isLoading) {
      setInitialized(true);
    }
  }, [user, organizations, isLoading, initialized]);

  // Update currentOrg if it changes in the organizations list
  useEffect(() => {
    if (!currentOrg || organizations.length === 0) return;

    const updatedOrg = organizations.find((org) => org.orgId === currentOrg.orgId);
    if (updatedOrg && JSON.stringify(updatedOrg) !== JSON.stringify(currentOrg)) {
      setCurrentOrgState(updatedOrg);
    }
  }, [organizations, currentOrg]);

  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentOrgState(null);
      setInitialized(false);
      queryClient.removeQueries({ queryKey: ['organizations'] });
    }
  }, [user, queryClient]);

  const setCurrentOrg = (org: Organization) => {
    setCurrentOrgState(org);
    localStorage.setItem(CURRENT_ORG_KEY, org.orgId);
  };

  const refetchOrganizations = () => {
    refetch();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrg,
        loading: isLoading && !initialized,
        error: error ? String(error) : null,
        refetchOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
