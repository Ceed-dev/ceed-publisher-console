'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TimeRange } from '@/types/analytics';
import { Header } from '@/components/layout/header';
import { KPIGrid } from '@/components/analytics/kpi-grid';
import { TimeRangePicker } from '@/components/analytics/time-range-picker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppQuery } from '@/hooks/use-apps-query';
import { useAnalyticsQuery } from '@/hooks/use-analytics-query';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { Settings, FileText, Code, BarChart3 } from 'lucide-react';

export default function AppOverviewPage() {
  const params = useParams();
  const appId = params.appId as string;

  const { data: app, isLoading, error: appError } = useAppQuery(appId);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
  });

  const {
    data: metrics,
    isLoading: analyticsLoading,
    isFetching: analyticsRefreshing,
    error: analyticsError,
  } = useAnalyticsQuery({ appId, timeRange });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!app || appError) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="App Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            {appError ? String(appError) : 'The app you are looking for does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={app.appName} description={`App ID: ${app.appId}`}>
        <div className="flex items-center gap-2">
          <Link href={`/apps/${appId}/logs`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Logs
            </Button>
          </Link>
          <Link href={`/apps/${appId}/integration`}>
            <Button variant="outline" size="sm">
              <Code className="mr-2 h-4 w-4" />
              Integration
            </Button>
          </Link>
          <Link href={`/apps/${appId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
            </TabsList>
            <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          </div>

          <TabsContent value="overview" className="space-y-6">
            <KPIGrid
              metrics={metrics || null}
              loading={analyticsLoading}
              isRefreshing={analyticsRefreshing && !analyticsLoading}
              error={analyticsError ? String(analyticsError) : null}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
