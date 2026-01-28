'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { App } from '@/types/app';

interface UseRealtimeAppResult {
  app: App | null;
  loading: boolean;
  error: string | null;
}

export function useRealtimeApp(appId: string | undefined): UseRealtimeAppResult {
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) {
      setApp(null);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();

    // Listen to single app document
    const unsubscribe = onSnapshot(
      doc(db, 'apps', appId),
      (snapshot) => {
        if (snapshot.exists()) {
          setApp({
            ...snapshot.data(),
            appId: snapshot.id,
          } as App);
          setError(null);
        } else {
          setApp(null);
          setError('App not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firestore app subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [appId]);

  return { app, loading, error };
}
