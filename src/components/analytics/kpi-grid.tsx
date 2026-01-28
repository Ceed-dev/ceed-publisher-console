'use client';

import { AnalyticsMetrics } from '@/types/analytics';
import { KPICard } from './kpi-card';
import { Activity, CheckCircle, BarChart3, Eye, MousePointer, Target } from 'lucide-react';

interface KPIGridProps {
  metrics: AnalyticsMetrics | null;
  loading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
}

export function KPIGrid({ metrics, loading, isRefreshing, error }: KPIGridProps) {
  // Only show skeleton on initial load with no data
  if (loading && !metrics) {
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

  if (error && !metrics) {
    return (
      <div className="rounded-lg border border-destructive bg-card p-8 text-center text-destructive">
        Error loading analytics: {error}
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
    <div className="relative">
      {isRefreshing && (
        <div className="absolute -top-6 right-0 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Updating...
        </div>
      )}
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${isRefreshing ? 'opacity-70' : ''}`}>
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
    </div>
  );
}
