'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { OrganizationMember } from '@/types/member';

interface UseRealtimeMembersResult {
  members: OrganizationMember[];
  loading: boolean;
  error: string | null;
}

export function useRealtimeMembers(orgId: string | undefined): UseRealtimeMembersResult {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();

    // Listen to members collection for this org
    const membersQuery = query(
      collection(db, 'organizationMembers'),
      where('orgId', '==', orgId)
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        const membersList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          memberId: doc.id,
        })) as OrganizationMember[];

        // Sort by role (owner first) then by join date
        membersList.sort((a, b) => {
          const roleOrder = { owner: 0, developer: 1, analyst: 2 };
          const roleCompare = (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
          if (roleCompare !== 0) return roleCompare;

          const aTime = a.meta?.createdAt?.seconds || 0;
          const bTime = b.meta?.createdAt?.seconds || 0;
          return aTime - bTime;
        });

        setMembers(membersList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore members subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  return { members, loading, error };
}
