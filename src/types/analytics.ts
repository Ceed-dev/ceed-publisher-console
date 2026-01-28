export interface AnalyticsMetrics {
  totalRequests: number;
  successfulRequests: number;
  fillRate: number;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export type TimeRangePreset = 'today' | '7d' | '30d' | '90d' | 'custom';

export interface AnalyticsDataPoint {
  date: string;
  requests: number;
  impressions: number;
  clicks: number;
}
