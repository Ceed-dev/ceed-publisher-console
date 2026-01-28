'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Organization } from '@/types/organization';
import { useAuth } from './auth-context';
import { useRealtimeOrganizations } from '@/hooks/use-realtime-organizations';

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  loading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

const CURRENT_ORG_KEY = 'cpc_current_org_id';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { organizations, loading, error } = useRealtimeOrganizations();
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Set initial org from localStorage or first org
  useEffect(() => {
    if (loading || initialized) return;

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
    } else if (!loading) {
      setInitialized(true);
    }
  }, [user, organizations, loading, initialized]);

  // Update currentOrg if it changes in the organizations list (real-time update)
  useEffect(() => {
    if (!currentOrg || organizations.length === 0) return;

    const updatedOrg = organizations.find((org) => org.orgId === currentOrg.orgId);
    if (updatedOrg && JSON.stringify(updatedOrg) !== JSON.stringify(currentOrg)) {
      setCurrentOrgState(updatedOrg);
    }
  }, [organizations, currentOrg]);

  const setCurrentOrg = (org: Organization) => {
    setCurrentOrgState(org);
    localStorage.setItem(CURRENT_ORG_KEY, org.orgId);
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrg,
        loading: loading && !initialized,
        error,
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
