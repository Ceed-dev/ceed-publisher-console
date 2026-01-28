'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { Organization } from '@/types/organization';
import { useAuth } from './auth-context';
import { getCached, setCache } from '@/lib/utils/cache';

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

const CURRENT_ORG_KEY = 'cpc_current_org_id';
const ORGS_CACHE_KEY = 'organizations';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const fetchOrganizations = useCallback(async (skipLoadingState = false) => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrgState(null);
      setLoading(false);
      return;
    }

    // Don't show loading spinner if we already have data
    if (!skipLoadingState && organizations.length === 0) {
      setLoading(true);
    }

    try {
      // Check cache first for instant display
      const cached = getCached<{ organizations: Organization[] }>(ORGS_CACHE_KEY, 60000);
      if (cached && !initialLoadDone.current) {
        setOrganizations(cached.organizations);
        const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
        const savedOrg = cached.organizations.find(
          (org: Organization) => org.orgId === savedOrgId
        );
        if (savedOrg) {
          setCurrentOrgState(savedOrg);
        } else if (cached.organizations.length > 0) {
          setCurrentOrgState(cached.organizations[0]);
        }
        setLoading(false);
        initialLoadDone.current = true;
      }

      // Fetch fresh data in background
      const response = await fetch('/api/dashboard/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();

      // Cache the response
      setCache(ORGS_CACHE_KEY, data);

      setOrganizations(data.organizations);

      const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
      const savedOrg = data.organizations.find(
        (org: Organization) => org.orgId === savedOrgId
      );

      if (savedOrg) {
        setCurrentOrgState(savedOrg);
      } else if (data.organizations.length > 0 && !currentOrg) {
        setCurrentOrgState(data.organizations[0]);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [user, organizations.length, currentOrg]);

  useEffect(() => {
    fetchOrganizations();
  }, [user]); // Only refetch when user changes, not on every fetchOrganizations change

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
        loading,
        refreshOrganizations: fetchOrganizations,
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
