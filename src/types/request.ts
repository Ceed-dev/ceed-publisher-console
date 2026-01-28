import { FirebaseTimestamp } from './common';
import { SupportedLanguage } from './app';

export type RequestStatus = 'success' | 'error' | 'no_fill';

export interface AdRequest {
  requestId: string;
  appId: string;
  status: RequestStatus;
  platform: 'web' | 'ios';
  language: SupportedLanguage;
  userAgent?: string;
  origin?: string;
  contextText?: string;
  contextTextHash?: string;
  contextTextMode?: 'truncated' | 'hashed' | 'full';
  errorCode?: string;
  errorMessage?: string;
  responseTimeMs?: number;
  meta: {
    createdAt: FirebaseTimestamp;
  };
}

export interface RequestFilters {
  status?: RequestStatus;
  platform?: 'web' | 'ios';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  cursor?: string;
}
