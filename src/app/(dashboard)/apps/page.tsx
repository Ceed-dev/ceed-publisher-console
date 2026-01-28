'use client';

import Link from 'next/link';
import { useOrganization } from '@/hooks/use-organization';
import { useAppsQuery } from '@/hooks/use-apps-query';
import { Header } from '@/components/layout/header';
import { AppCard } from '@/components/apps/app-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AppsPage() {
  const { currentOrg, loading: orgLoading } = useOrganization();
  const { data: apps = [], isLoading, error } = useAppsQuery(currentOrg?.orgId);

  // Show loading only on initial load
  if ((orgLoading || isLoading) && apps.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Apps" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <h2 className="text-xl font-semibold">No Organization</h2>
          <p className="text-muted-foreground">
            Create an organization to start adding apps
          </p>
          <Link href="/organizations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Apps" description={`Manage apps for ${currentOrg.name}`} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-destructive">Error loading apps: {String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Apps" description={`Manage apps for ${currentOrg.name}`}>
        <Link href="/apps/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New App
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No Apps Yet</h2>
            <p className="text-muted-foreground">
              Create your first app to start integrating the Ceed Ads SDK
            </p>
            <Link href="/apps/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create App
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.appId} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
