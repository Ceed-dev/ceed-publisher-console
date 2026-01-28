'use client';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

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
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'no_fill', label: 'No Fill' },
  ];

  const platformOptions = [
    { value: '', label: 'All Platforms' },
    { value: 'web', label: 'Web' },
    { value: 'ios', label: 'iOS' },
  ];

  const eventTypeOptions = [
    { value: '', label: 'All Events' },
    { value: 'impression', label: 'Impression' },
    { value: 'click', label: 'Click' },
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
          placeholder={type === 'requests' ? 'Search by request ID...' : 'Search by request ID...'}
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>

      {Object.values(filters).some((v) => v) && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
