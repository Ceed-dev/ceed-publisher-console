'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { App } from '@/types/app';
import { AdRequest } from '@/types/request';
import { AdEvent } from '@/types/event';
import { Header } from '@/components/layout/header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/logs/requests-table';
import { EventsTable } from '@/components/logs/events-table';
import { LogFilters } from '@/components/logs/log-filters';
import { ExportButton } from '@/components/logs/export-button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function LogsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const appId = params.appId as string;

  const initialTab = searchParams.get('tab') || 'requests';
  const initialRequestId = searchParams.get('requestId') || '';

  const [app, setApp] = useState<App | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [events, setEvents] = useState<AdEvent[]>([]);
  const [requestFilters, setRequestFilters] = useState<{
    status?: string;
    platform?: string;
    search?: string;
  }>({});
  const [eventFilters, setEventFilters] = useState<{
    eventType?: string;
    search?: string;
  }>({ search: initialRequestId });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (requestFilters.status) queryParams.set('status', requestFilters.status);
      if (requestFilters.platform) queryParams.set('platform', requestFilters.platform);

      const response = await fetch(
        `/api/dashboard/apps/${appId}/logs/requests?${queryParams}`
      );
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  }, [appId, requestFilters]);

  const fetchEvents = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (eventFilters.eventType) queryParams.set('eventType', eventFilters.eventType);
      if (eventFilters.search) queryParams.set('requestId', eventFilters.search);

      const response = await fetch(
        `/api/dashboard/apps/${appId}/logs/events?${queryParams}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, [appId, eventFilters]);

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

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchEvents();
    }
  }, [activeTab, fetchRequests, fetchEvents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'requests') {
      await fetchRequests();
    } else {
      await fetchEvents();
    }
    setRefreshing(false);
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
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
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
            <RequestsTable requests={requests} appId={appId} />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <LogFilters
              filters={eventFilters}
              onChange={setEventFilters}
              type="events"
            />
            <EventsTable events={events} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
