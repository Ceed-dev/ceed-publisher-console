'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { V2DecisionMeta } from '@/types/request';

interface V2MetaDetailProps {
  v2Meta: V2DecisionMeta | null | undefined;
}

type IntentType = 'sensitive' | 'chitchat' | 'low_intent' | 'medium_commercial' | 'high_commercial';

const intentVariants: Record<IntentType, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  sensitive: 'destructive',
  chitchat: 'outline',
  low_intent: 'outline',
  medium_commercial: 'warning',
  high_commercial: 'success',
};

function ProgressBar({ value, max = 1 }: { value: number; max?: number }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right">
        {value.toFixed(3)}
      </span>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-border pt-2 mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <Icon className="h-3 w-3" />
        <span>{title}</span>
      </button>
      {isOpen && <div className="mt-2 pl-4">{children}</div>}
    </div>
  );
}

function ScoreRow({ label, value, isPositive }: { label: string; value: number; isPositive?: boolean }) {
  const colorClass = isPositive === undefined
    ? 'text-foreground'
    : isPositive
      ? 'text-green-500'
      : 'text-red-500';

  const prefix = isPositive === true && value > 0 ? '+' : '';

  return (
    <div className="flex justify-between items-center text-xs py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={colorClass}>
        {prefix}{value.toFixed(4)}
      </span>
    </div>
  );
}

function TimingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-xs py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value.toFixed(0)}ms</span>
    </div>
  );
}

export function V2MetaDetail({ v2Meta }: V2MetaDetailProps) {
  const t = useTranslations('requestsTable');

  if (!v2Meta) {
    return (
      <span className="text-xs text-muted-foreground">-</span>
    );
  }

  const intentKey = v2Meta.oppIntent as IntentType;
  const intentVariant = intentVariants[intentKey] || 'outline';

  return (
    <div className="space-y-2 min-w-[200px]">
      {/* Primary Metrics */}
      <div className="space-y-1.5">
        {/* Opportunity Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{t('oppScore')}</span>
          </div>
          <ProgressBar value={v2Meta.oppScore} />
        </div>

        {/* Intent */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t('oppIntent')}</span>
          <Badge variant={intentVariant} className="text-[10px] px-1.5 py-0">
            {t(`intentTypes.${intentKey}`)}
          </Badge>
        </div>

        {/* Candidate Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t('candidateCount')}</span>
          <span className="text-xs font-medium">{v2Meta.candidateCount}</span>
        </div>

        {/* Final Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t('finalScore')}</span>
          <span className="text-xs font-medium">{v2Meta.finalScore.toFixed(4)}</span>
        </div>

        {/* Fallback Used */}
        {v2Meta.fallbackUsed && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t('fallback')}</span>
            <Badge variant="warning" className="text-[10px] px-1.5 py-0">
              {t('used')}
            </Badge>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <CollapsibleSection title={t('scoreBreakdown')} icon={Target}>
        <div className="space-y-0.5">
          <ScoreRow label={t('baseScore')} value={v2Meta.scoreBreakdown.baseScore} />
          <ScoreRow
            label={t('relevanceBoost')}
            value={v2Meta.scoreBreakdown.relevanceBoost}
            isPositive={true}
          />
          <ScoreRow
            label={t('fatiguePenalty')}
            value={v2Meta.scoreBreakdown.fatiguePenalty}
            isPositive={false}
          />
          <ScoreRow
            label={t('formatPenalty')}
            value={v2Meta.scoreBreakdown.formatPenalty}
            isPositive={false}
          />
          <ScoreRow
            label={t('explorationBonus')}
            value={v2Meta.scoreBreakdown.explorationBonus}
            isPositive={true}
          />
        </div>
      </CollapsibleSection>

      {/* Phase Timings */}
      <CollapsibleSection title={t('phaseTimings')} icon={Clock}>
        <div className="space-y-0.5">
          <TimingRow label={t('opportunityMs')} value={v2Meta.phaseTimings.opportunityMs} />
          <TimingRow label={t('candidateMs')} value={v2Meta.phaseTimings.candidateMs} />
          <TimingRow label={t('rankingMs')} value={v2Meta.phaseTimings.rankingMs} />
          <div className="border-t border-border pt-1 mt-1">
            <TimingRow label={t('totalMs')} value={v2Meta.phaseTimings.totalMs} />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
