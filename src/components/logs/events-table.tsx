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
import { timestampToDate } from '@/lib/utils/timestamp';
import { useTranslations } from 'next-intl';

interface EventsTableProps {
  events: AdEvent[];
  loading?: boolean;
}

export function EventsTable({ events, loading }: EventsTableProps) {
  const t = useTranslations('eventsTable');
  const tLogs = useTranslations('logs');
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
        {tLogs('noEventsFound')}
      </div>
    );
  }

  const getEventTypeBadge = (eventType: AdEvent['eventType']) => {
    switch (eventType) {
      case 'impression':
        return <Badge variant="default">{t('impression')}</Badge>;
      case 'click':
        return <Badge variant="success">{t('click')}</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('eventId')}</TableHead>
          <TableHead>{t('type')}</TableHead>
          <TableHead>{t('requestId')}</TableHead>
          <TableHead>{t('adId')}</TableHead>
          <TableHead>{t('origin')}</TableHead>
          <TableHead>{t('createdAt')}</TableHead>
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
              {format(timestampToDate(event.meta.createdAt), 'MMM d, HH:mm:ss')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
