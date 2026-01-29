'use client';

import { AdRequest } from '@/types/request';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { timestampToDate } from '@/lib/utils/timestamp';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface RequestsTableProps {
  requests: AdRequest[];
  loading?: boolean;
  appId: string;
}

export function RequestsTable({ requests, loading, appId }: RequestsTableProps) {
  const t = useTranslations('requestsTable');
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

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        {tLogs('noRequestsFound')}
      </div>
    );
  }

  const getStatusBadge = (status: AdRequest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">{t('success')}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t('error')}</Badge>;
      case 'no_fill':
        return <Badge variant="warning">{t('noFill')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('requestId')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('platform')}</TableHead>
          <TableHead>{t('language')}</TableHead>
          <TableHead>{t('responseTime')}</TableHead>
          <TableHead>{t('createdAt')}</TableHead>
          <TableHead>{t('events')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.requestId}>
            <TableCell className="font-mono text-xs">
              {request.requestId.slice(0, 8)}...
            </TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="capitalize">{request.platform}</TableCell>
            <TableCell className="uppercase">{request.language}</TableCell>
            <TableCell>
              {request.responseTimeMs ? `${request.responseTimeMs}ms` : '-'}
            </TableCell>
            <TableCell>
              {format(timestampToDate(request.meta.createdAt), 'MMM d, HH:mm:ss')}
            </TableCell>
            <TableCell>
              <Link href={`/apps/${appId}/logs?requestId=${request.requestId}&tab=events`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
