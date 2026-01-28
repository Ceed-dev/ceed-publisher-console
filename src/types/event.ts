import { FirebaseTimestamp } from './common';

export type EventType = 'impression' | 'click';

export interface AdEvent {
  eventId: string;
  appId: string;
  requestId: string;
  eventType: EventType;
  adId?: string;
  userAgent?: string;
  origin?: string;
  meta: {
    createdAt: FirebaseTimestamp;
  };
}

export interface EventFilters {
  eventType?: EventType;
  requestId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  cursor?: string;
}
