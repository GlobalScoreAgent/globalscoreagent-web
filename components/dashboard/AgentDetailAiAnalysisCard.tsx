'use client';

import { useState } from 'react';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { DashboardStatusVideo } from '@/components/dashboard/DashboardStatusVideo';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { cn } from '@/lib/utils';

const AI_RESEARCHING_VIDEO = '/animations/agent-researching.mp4';

const PURPOSE_PREVIEW_CHARS = 200;

type Props = {
  primary: unknown;
  secondary: unknown;
  confidence: unknown;
  purpose: unknown;
  isDark: boolean;
  t: Translations;
  className?: string;
};

function textOrNa(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

function formatSecondary(value: unknown, fallback: string): string {
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

function confidencePercent(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function confidenceBadgeClass(pct: number | null, isDark: boolean): string {
  if (pct === null) {
    return isDark
      ? 'border-zinc-600 bg-zinc-800 text-zinc-400'
      : 'border-zinc-300 bg-zinc-100 text-zinc-600';
  }
  if (pct < 40) {
    return isDark
      ? 'border-rose-500/40 bg-rose-500/15 text-rose-200'
      : 'border-rose-400/50 bg-rose-50 text-rose-800';
  }
  if (pct < 55) {
    return isDark
      ? 'border-orange-500/40 bg-orange-500/15 text-orange-200'
      : 'border-orange-400/50 bg-orange-50 text-orange-900';
  }
  if (pct < 85) {
    return isDark
      ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
      : 'border-emerald-400/50 bg-emerald-50 text-emerald-800';
  }
  return isDark
    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-100'
    : 'border-emerald-600/40 bg-emerald-100 text-emerald-900';
}

function FieldRow({
  label,
  value,
  isDark,
  clamp,
  title,
}: {
  label: string;
  value: string;
  isDark: boolean;
  clamp?: boolean;
  title?: string;
}) {
  return (
    <div className="min-w-0">
      <p
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          isDark ? 'text-zinc-500' : 'text-zinc-500'
        }`}
      >
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-sm font-medium',
          isDark ? 'text-zinc-100' : 'text-zinc-900',
          clamp && 'leading-snug',
        )}
        title={title}
      >
        {value}
      </p>
    </div>
  );
}

export function AgentDetailAiAnalysisCard({
  primary,
  secondary,
  confidence,
  purpose,
  isDark,
  t,
  className,
}: Props) {
  const [purposeModalOpen, setPurposeModalOpen] = useState(false);

  const hasCategory = typeof primary === 'string' && primary.trim().length > 0;

  const primaryText = textOrNa(primary, t.notAvailable);
  const secondaryText = formatSecondary(secondary, t.notAvailable);
  const purposeFull = textOrNa(purpose, t.noDescription);
  const hasPurpose = purposeFull !== t.noDescription;
  const showPurposeReadMore = hasPurpose && purposeFull.length > PURPOSE_PREVIEW_CHARS;
  const purposePreview = showPurposeReadMore
    ? `${purposeFull.slice(0, PURPOSE_PREVIEW_CHARS)}…`
    : purposeFull;

  const pct = confidencePercent(confidence);
  const confidenceLabel = pct === null ? t.notAvailable : `${pct}%`;

  return (
    <>
      <AgentDetailCard
        isDark={isDark}
        variant="chain"
        accentHex="#10B981"
        className={cn('flex min-h-0 min-w-0 flex-col', className)}
        contentClassName="flex min-h-0 flex-1 flex-col p-4"
      >
        <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
          <h3
            className={`min-w-0 text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            {t.agentDetailAiAnalysisTitle}
          </h3>
          {hasCategory ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums',
                confidenceBadgeClass(pct, isDark),
              )}
              title={t.aiCategoryConfidenceLabel}
            >
              {confidenceLabel}
            </span>
          ) : null}
        </div>

        {hasCategory ? (
          <div className="min-h-0 flex-1 space-y-3">
            <FieldRow
              label={t.aiCategoryPrimaryLabel}
              value={primaryText}
              isDark={isDark}
              title={primaryText !== t.notAvailable ? primaryText : undefined}
            />
            <FieldRow
              label={t.aiCategorySecondaryLabel}
              value={secondaryText}
              isDark={isDark}
              clamp
              title={secondaryText !== t.notAvailable ? secondaryText : undefined}
            />
            <div className="min-w-0">
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isDark ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                {t.aiCategoryPurposeLabel}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-sm font-medium leading-snug',
                  isDark ? 'text-zinc-100' : 'text-zinc-900',
                )}
              >
                {purposePreview}
              </p>
              {showPurposeReadMore ? (
                <button
                  type="button"
                  className="mt-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  onClick={() => setPurposeModalOpen(true)}
                >
                  {t.readMoreDescription}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="relative min-h-[11rem] flex-1 overflow-hidden rounded-2xl xl:min-h-0">
            <DashboardStatusVideo
              src={AI_RESEARCHING_VIDEO}
              label={t.aiCategoryAnalyzingLabel}
              isDark={isDark}
              className="absolute inset-0"
            />
          </div>
        )}
      </AgentDetailCard>

      {purposeModalOpen ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isDark ? 'bg-black/70' : 'bg-black/40'
          }`}
          role="presentation"
          onClick={() => setPurposeModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-purpose-modal-title"
            className={`max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl ${
              isDark ? 'border border-zinc-700 bg-zinc-900' : 'border border-zinc-200 bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="ai-purpose-modal-title"
                className={`text-xl font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
              >
                {t.aiCategoryPurposeLabel}
              </h2>
              <button
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm ${
                  isDark
                    ? 'border-zinc-600 hover:bg-white/10'
                    : 'border-zinc-300 hover:bg-zinc-100'
                }`}
                onClick={() => setPurposeModalOpen(false)}
              >
                {t.closeModal}
              </button>
            </div>
            <p
              className={`whitespace-pre-wrap leading-relaxed ${
                isDark ? 'text-gray-200' : 'text-zinc-800'
              }`}
            >
              {purposeFull}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
