import { FirebaseTimestamp } from './common';
import { SupportedLanguage } from './app';

export type RequestStatus = 'success' | 'error' | 'no_fill';

export type AlgorithmVersion = 'v1' | 'v2';

export interface V2PhaseTimings {
  opportunityMs: number;
  candidateMs: number;
  rankingMs: number;
  totalMs: number;
}

export interface V2ScoreBreakdown {
  baseScore: number;
  relevanceBoost: number;
  fatiguePenalty: number;
  formatPenalty: number;
  explorationBonus: number;
}

export interface V2DecisionMeta {
  oppScore: number;
  oppIntent: string;
  candidateCount: number;
  finalScore: number;
  scoreBreakdown: V2ScoreBreakdown;
  fallbackUsed: boolean;
  phaseTimings: V2PhaseTimings;
}

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
  algorithmVersion?: AlgorithmVersion;
  v2Meta?: V2DecisionMeta;
}

export interface RequestFilters {
  status?: RequestStatus;
  platform?: 'web' | 'ios';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  cursor?: string;
}
