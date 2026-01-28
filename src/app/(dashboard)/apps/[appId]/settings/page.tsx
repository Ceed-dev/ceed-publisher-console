'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { App, AppSettings } from '@/types/app';
import { Header } from '@/components/layout/header';
import { SettingsForm } from '@/components/apps/settings-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const params = useParams();
  const appId = params.appId as string;

  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await fetch(`/api/dashboard/apps/${appId}`);
        if (response.ok) {
          const data = await response.json();
          setApp(data.app);
        }
      } catch (error) {
        console.error('Failed to fetch app:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [appId]);

  const handleSave = async (settings: Partial<AppSettings>) => {
    const response = await fetch(`/api/dashboard/apps/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save settings');
    }

    const data = await response.json();
    setApp(data.app);
  };

  const handleStatusToggle = async () => {
    if (!app) return;

    const newStatus = app.status === 'active' ? 'suspended' : 'active';
    const response = await fetch(`/api/dashboard/apps/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      const data = await response.json();
      setApp(data.app);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="App Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            The app you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Settings" description={app.appName}>
        <Link href={`/apps/${appId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </Link>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>App Status</CardTitle>
            <CardDescription>
              Control whether this app can receive ad requests
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={app.status === 'active' ? 'success' : 'destructive'}>
                {app.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {app.status === 'active'
                  ? 'App is receiving ad requests'
                  : 'App is not receiving ad requests'}
              </span>
            </div>
            <Button
              variant={app.status === 'active' ? 'destructive' : 'primary'}
              onClick={handleStatusToggle}
            >
              {app.status === 'active' ? 'Suspend App' : 'Activate App'}
            </Button>
          </CardContent>
        </Card>

        {app.status === 'suspended' && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500 bg-yellow-500/10 p-4 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            <span>
              This app is currently suspended. Ad requests will be rejected until
              you activate it.
            </span>
          </div>
        )}

        <SettingsForm app={app} onSave={handleSave} />
      </div>
    </div>
  );
}
