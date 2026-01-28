'use client';

import { AnalyticsMetrics } from '@/types/analytics';
import { KPICard } from './kpi-card';
import { Activity, CheckCircle, BarChart3, Eye, MousePointer, Target } from 'lucide-react';

interface KPIGridProps {
  metrics: AnalyticsMetrics | null;
  loading?: boolean;
}

export function KPIGrid({ metrics, loading }: KPIGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border bg-card"
          />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercent = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return '0%';
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Total Requests"
        value={formatNumber(metrics.totalRequests)}
        icon={Activity}
      />
      <KPICard
        title="Successful Requests"
        value={formatNumber(metrics.successfulRequests)}
        icon={CheckCircle}
      />
      <KPICard
        title="Fill Rate"
        value={formatPercent(metrics.fillRate)}
        icon={BarChart3}
      />
      <KPICard
        title="Total Impressions"
        value={formatNumber(metrics.totalImpressions)}
        icon={Eye}
      />
      <KPICard
        title="Total Clicks"
        value={formatNumber(metrics.totalClicks)}
        icon={MousePointer}
      />
      <KPICard
        title="Click-Through Rate"
        value={formatPercent(metrics.clickThroughRate)}
        icon={Target}
      />
    </div>
  );
}
