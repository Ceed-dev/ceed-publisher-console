'use client';

import { useState } from 'react';
import { AdRequest, V2DecisionMeta } from '@/types/request';
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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ExternalLink, Info } from 'lucide-react';
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
  const [selectedV2Meta, setSelectedV2Meta] = useState<V2DecisionMeta | null>(null);
  const [v2DialogOpen, setV2DialogOpen] = useState(false);

  const handleV2DetailClick = (v2Meta: V2DecisionMeta) => {
    setSelectedV2Meta(v2Meta);
    setV2DialogOpen(true);
  };

  const getAlgorithmBadge = (request: AdRequest) => {
    const version = request.algorithmVersion || 'v1';
    if (version === 'v2') {
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-blue-500 text-white">v2</Badge>
          {request.v2Meta && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleV2DetailClick(request.v2Meta!);
              }}
            >
              <Info className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }
    return <Badge variant="outline">v1</Badge>;
  };

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
          <TableHead>{t('algorithm')}</TableHead>
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
            <TableCell>{getAlgorithmBadge(request)}</TableCell>
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

      {/* V2 Algorithm Details Dialog */}
      <Dialog open={v2DialogOpen} onClose={() => setV2DialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{t('v2Details')}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {selectedV2Meta && (
            <div className="space-y-4">
              {/* Opportunity Assessment */}
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('opportunityAssessment')}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('oppScore')}:</div>
                  <div className="font-mono">{selectedV2Meta.oppScore.toFixed(2)}</div>
                  <div className="text-muted-foreground">{t('oppIntent')}:</div>
                  <div>{selectedV2Meta.oppIntent}</div>
                </div>
              </div>

              {/* Ad Selection */}
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('adSelection')}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('candidateCount')}:</div>
                  <div className="font-mono">{selectedV2Meta.candidateCount}</div>
                  <div className="text-muted-foreground">{t('finalScore')}:</div>
                  <div className="font-mono">{selectedV2Meta.finalScore.toFixed(2)}</div>
                  <div className="text-muted-foreground">{t('fallbackUsed')}:</div>
                  <div>{selectedV2Meta.fallbackUsed ? t('yes') : t('no')}</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('scoreBreakdown')}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('baseScore')}:</div>
                  <div className="font-mono">{selectedV2Meta.scoreBreakdown.baseScore.toFixed(2)}</div>
                  <div className="text-muted-foreground">{t('relevanceBoost')}:</div>
                  <div className="font-mono text-green-600">+{selectedV2Meta.scoreBreakdown.relevanceBoost.toFixed(2)}</div>
                  <div className="text-muted-foreground">{t('fatiguePenalty')}:</div>
                  <div className="font-mono text-red-600">{selectedV2Meta.scoreBreakdown.fatiguePenalty.toFixed(2)}</div>
                  <div className="text-muted-foreground">{t('formatPenalty')}:</div>
                  <div className="font-mono text-red-600">{selectedV2Meta.scoreBreakdown.formatPenalty.toFixed(2)}</div>
                  <div className="text-muted-foreground">{t('explorationBonus')}:</div>
                  <div className="font-mono text-blue-600">+{selectedV2Meta.scoreBreakdown.explorationBonus.toFixed(2)}</div>
                </div>
              </div>

              {/* Phase Timings */}
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('phaseTimings')}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('opportunityMs')}:</div>
                  <div className="font-mono">{selectedV2Meta.phaseTimings.opportunityMs}ms</div>
                  <div className="text-muted-foreground">{t('candidateMs')}:</div>
                  <div className="font-mono">{selectedV2Meta.phaseTimings.candidateMs}ms</div>
                  <div className="text-muted-foreground">{t('rankingMs')}:</div>
                  <div className="font-mono">{selectedV2Meta.phaseTimings.rankingMs}ms</div>
                  <div className="text-muted-foreground font-semibold">{t('totalMs')}:</div>
                  <div className="font-mono font-semibold">{selectedV2Meta.phaseTimings.totalMs}ms</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Table>
  );
}
