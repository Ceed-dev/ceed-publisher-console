'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimeRange, TimeRangePreset } from '@/types/analytics';
import { startOfDay, endOfDay, subDays } from 'date-fns';

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const presets: { label: string; value: TimeRangePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const [activePreset, setActivePreset] = useState<TimeRangePreset>('7d');

  const handlePresetClick = (preset: TimeRangePreset) => {
    setActivePreset(preset);
    const now = new Date();

    let startDate: Date;
    const endDate = endOfDay(now);

    switch (preset) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '7d':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '30d':
        startDate = startOfDay(subDays(now, 30));
        break;
      case '90d':
        startDate = startOfDay(subDays(now, 90));
        break;
      default:
        startDate = startOfDay(subDays(now, 7));
    }

    onChange({ startDate, endDate });
  };

  return (
    <div className="flex items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.value}
          variant={activePreset === preset.value ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
