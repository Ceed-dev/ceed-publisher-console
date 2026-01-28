'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/logs/requests-table';
import { EventsTable } from '@/components/logs/events-table';
import { LogFilters } from '@/components/logs/log-filters';
import { ExportButton } from '@/components/logs/export-button';
import { useAppQuery } from '@/hooks/use-apps-query';
import { useRequestLogsQuery, useEventLogsQuery } from '@/hooks/use-logs-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function LogsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const appId = params.appId as string;

  const initialTab = searchParams.get('tab') || 'requests';
  const initialRequestId = searchParams.get('requestId') || '';

  const { data: app, isLoading: appLoading } = useAppQuery(appId);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [requestFilters, setRequestFilters] = useState<{
    status?: string;
    platform?: string;
    search?: string;
  }>({});
  const [eventFilters, setEventFilters] = useState<{
    eventType?: string;
    search?: string;
  }>({ search: initialRequestId });

  const {
    data: requests = [],
    isLoading: requestsLoading,
    isFetching: requestsRefreshing,
    refetch: refetchRequests,
  } = useRequestLogsQuery(appId, {
    status: requestFilters.status,
    platform: requestFilters.platform,
  });

  const {
    data: events = [],
    isLoading: eventsLoading,
    isFetching: eventsRefreshing,
    refetch: refetchEvents,
  } = useEventLogsQuery(appId, {
    eventType: eventFilters.eventType,
    requestId: eventFilters.search,
  });

  const handleRefresh = async () => {
    if (activeTab === 'requests') {
      await refetchRequests();
    } else {
      await refetchEvents();
    }
  };

  const isRefreshing =
    activeTab === 'requests'
      ? requestsRefreshing && !requestsLoading
      : eventsRefreshing && !eventsLoading;

  if (appLoading) {
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
      <Header title="Logs" description={app.appName}>
        <Link href={`/apps/${appId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </Link>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <ExportButton
                data={activeTab === 'requests' ? requests : events}
                type={activeTab as 'requests' | 'events'}
                appId={appId}
              />
            </div>
          </div>

          <TabsContent value="requests" className="space-y-4">
            <LogFilters
              filters={requestFilters}
              onChange={setRequestFilters}
              type="requests"
            />
            {requestsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <RequestsTable requests={requests} appId={appId} />
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <LogFilters
              filters={eventFilters}
              onChange={setEventFilters}
              type="events"
            />
            {eventsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <EventsTable events={events} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
