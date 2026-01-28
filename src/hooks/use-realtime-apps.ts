'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { App } from '@/types/app';

interface UseRealtimeAppsResult {
  apps: App[];
  loading: boolean;
  error: string | null;
}

export function useRealtimeApps(orgId: string | undefined): UseRealtimeAppsResult {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setApps([]);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();

    // Listen to apps collection for this org
    const appsQuery = query(
      collection(db, 'apps'),
      where('orgId', '==', orgId)
    );

    const unsubscribe = onSnapshot(
      appsQuery,
      (snapshot) => {
        const appsList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          appId: doc.id,
        })) as App[];

        // Sort by creation date (newest first)
        appsList.sort((a, b) => {
          const aTime = a.meta?.createdAt?.seconds || 0;
          const bTime = b.meta?.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setApps(appsList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore apps subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  return { apps, loading, error };
}
