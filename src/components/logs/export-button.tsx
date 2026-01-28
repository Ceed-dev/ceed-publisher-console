'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCSV, downloadCSV } from '@/lib/utils/csv-export';
import { AdRequest } from '@/types/request';
import { AdEvent } from '@/types/event';
import { format } from 'date-fns';
import { timestampToDate } from '@/lib/utils/timestamp';

interface ExportButtonProps {
  data: AdRequest[] | AdEvent[];
  type: 'requests' | 'events';
  appId: string;
}

export function ExportButton({ data, type, appId }: ExportButtonProps) {
  const handleExport = () => {
    let csv: string;
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');

    if (type === 'requests') {
      const requests = data as AdRequest[];
      csv = generateCSV(
        requests.map((r) => ({
          requestId: r.requestId,
          status: r.status,
          platform: r.platform,
          language: r.language,
          responseTimeMs: r.responseTimeMs || '',
          origin: r.origin || '',
          errorCode: r.errorCode || '',
          createdAt: format(timestampToDate(r.meta.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        })),
        [
          { key: 'requestId', header: 'Request ID' },
          { key: 'status', header: 'Status' },
          { key: 'platform', header: 'Platform' },
          { key: 'language', header: 'Language' },
          { key: 'responseTimeMs', header: 'Response Time (ms)' },
          { key: 'origin', header: 'Origin' },
          { key: 'errorCode', header: 'Error Code' },
          { key: 'createdAt', header: 'Created At' },
        ]
      );
      downloadCSV(csv, `requests-${appId}-${timestamp}.csv`);
    } else {
      const events = data as AdEvent[];
      csv = generateCSV(
        events.map((e) => ({
          eventId: e.eventId,
          eventType: e.eventType,
          requestId: e.requestId,
          adId: e.adId || '',
          origin: e.origin || '',
          createdAt: format(timestampToDate(e.meta.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        })),
        [
          { key: 'eventId', header: 'Event ID' },
          { key: 'eventType', header: 'Event Type' },
          { key: 'requestId', header: 'Request ID' },
          { key: 'adId', header: 'Ad ID' },
          { key: 'origin', header: 'Origin' },
          { key: 'createdAt', header: 'Created At' },
        ]
      );
      downloadCSV(csv, `events-${appId}-${timestamp}.csv`);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}
