'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimeRange, TimeRangePreset } from '@/types/analytics';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { useTranslations } from 'next-intl';

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const presetKeys = ['today', '7days', '30days', '90days'] as const;
const presetValues: TimeRangePreset[] = ['today', '7d', '30d', '90d'];

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const [activePreset, setActivePreset] = useState<TimeRangePreset>('7d');
  const t = useTranslations('timeRange');

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
      {presetKeys.map((key, index) => (
        <Button
          key={presetValues[index]}
          variant={activePreset === presetValues[index] ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick(presetValues[index])}
        >
          {t(key)}
        </Button>
      ))}
    </div>
  );
}
