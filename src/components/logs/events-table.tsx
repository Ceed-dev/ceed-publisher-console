'use client';

import { AdEvent } from '@/types/event';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface EventsTableProps {
  events: AdEvent[];
  loading?: boolean;
}

export function EventsTable({ events, loading }: EventsTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No events found
      </div>
    );
  }

  const getEventTypeBadge = (eventType: AdEvent['eventType']) => {
    switch (eventType) {
      case 'impression':
        return <Badge variant="default">Impression</Badge>;
      case 'click':
        return <Badge variant="success">Click</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Request ID</TableHead>
          <TableHead>Ad ID</TableHead>
          <TableHead>Origin</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.eventId}>
            <TableCell className="font-mono text-xs">
              {event.eventId.slice(0, 8)}...
            </TableCell>
            <TableCell>{getEventTypeBadge(event.eventType)}</TableCell>
            <TableCell className="font-mono text-xs">
              {event.requestId.slice(0, 8)}...
            </TableCell>
            <TableCell className="font-mono text-xs">
              {event.adId ? `${event.adId.slice(0, 8)}...` : '-'}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {event.origin || '-'}
            </TableCell>
            <TableCell>
              {format(event.meta.createdAt.toDate(), 'MMM d, HH:mm:ss')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
