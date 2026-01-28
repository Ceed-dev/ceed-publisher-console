'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/auth-context';
import { Organization } from '@/types/organization';
import { OrganizationMember } from '@/types/member';

interface UseRealtimeOrganizationsResult {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
}

export function useRealtimeOrganizations(): UseRealtimeOrganizationsResult {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();

    // Listen to organizationMembers where userId matches current user
    const membersQuery = query(
      collection(db, 'organizationMembers'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      async (snapshot) => {
        try {
          const members = snapshot.docs.map((doc) => ({
            ...doc.data(),
            memberId: doc.id,
          })) as OrganizationMember[];

          // Fetch organization details for each membership
          const orgPromises = members.map(async (member) => {
            const orgDoc = await getDoc(doc(db, 'organizations', member.orgId));
            if (orgDoc.exists()) {
              return {
                ...orgDoc.data(),
                orgId: orgDoc.id,
              } as Organization;
            }
            return null;
          });

          const orgs = (await Promise.all(orgPromises)).filter(
            (org): org is Organization => org !== null
          );

          setOrganizations(orgs);
          setError(null);
        } catch (err) {
          console.error('Error processing organizations:', err);
          setError(err instanceof Error ? err.message : 'Failed to load organizations');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { organizations, loading, error };
}
