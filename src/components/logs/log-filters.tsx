'use client';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LogFiltersProps {
  filters: {
    status?: string;
    platform?: string;
    eventType?: string;
    search?: string;
  };
  onChange: (filters: LogFiltersProps['filters']) => void;
  type: 'requests' | 'events';
}

export function LogFilters({ filters, onChange, type }: LogFiltersProps) {
  const t = useTranslations('logFilters');

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'success', label: t('success') },
    { value: 'error', label: t('error') },
    { value: 'no_fill', label: t('noFill') },
  ];

  const platformOptions = [
    { value: '', label: t('allPlatforms') },
    { value: 'web', label: t('web') },
    { value: 'ios', label: t('ios') },
  ];

  const eventTypeOptions = [
    { value: '', label: t('allEvents') },
    { value: 'impression', label: t('impression') },
    { value: 'click', label: t('click') },
  ];

  const handleClear = () => {
    onChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {type === 'requests' && (
        <>
          <Select
            options={statusOptions}
            value={filters.status || ''}
            onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
            className="w-40"
          />
          <Select
            options={platformOptions}
            value={filters.platform || ''}
            onChange={(e) => onChange({ ...filters, platform: e.target.value || undefined })}
            className="w-40"
          />
        </>
      )}

      {type === 'events' && (
        <Select
          options={eventTypeOptions}
          value={filters.eventType || ''}
          onChange={(e) => onChange({ ...filters, eventType: e.target.value || undefined })}
          className="w-40"
        />
      )}

      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchByRequestId')}
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>

      {Object.values(filters).some((v) => v) && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4 mr-1" />
          {t('clear')}
        </Button>
      )}
    </div>
  );
}
