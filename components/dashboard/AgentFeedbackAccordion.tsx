'use client';

import { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentCommentsSummaryPanel } from '@/components/dashboard/AgentCommentsSummaryPanel';
import { AgentAttestationsSummaryPanel } from '@/components/dashboard/AgentAttestationsSummaryPanel';
import { AgentExternalAuditSummaryPanel } from '@/components/dashboard/AgentExternalAuditSummaryPanel';
import { AgentIdentityAnalysisSummaryPanel } from '@/components/dashboard/AgentIdentityAnalysisSummaryPanel';
import { AgentOnChainExecutionSummaryPanel } from '@/components/dashboard/AgentOnChainExecutionSummaryPanel';
import { AgentOnChainFeedbackSummaryPanel } from '@/components/dashboard/AgentOnChainFeedbackSummaryPanel';
import { AgentProtocolActivitySummaryPanel } from '@/components/dashboard/AgentProtocolActivitySummaryPanel';
import { parseCommentsSummary } from '@/lib/agentCommentsSummary';
import { parseAttestationsSummary } from '@/lib/agentAttestationsSummary';
import { parseExternalAuditSummary } from '@/lib/agentExternalAuditSummary';
import { parseIdentityAnalysisSummary } from '@/lib/agentIdentityAnalysisSummary';
import { parseOnChainExecutionSummary } from '@/lib/agentOnChainExecutionSummary';
import { parseOnChainFeedbackSummary } from '@/lib/agentOnChainFeedbackSummary';
import { parseProtocolActivitySummary } from '@/lib/agentProtocolActivitySummary';
import { cn } from '@/lib/utils';

export type AgentFeedbackRow = {
  summaryField: string;
  hasField: string;
  labelKey: keyof Translations;
};

type Props = {
  agent: Record<string, unknown>;
  isDark: boolean;
  t: Translations;
  rows: AgentFeedbackRow[];
  expandedField: string | null;
  onExpandedChange: (field: string | null) => void;
  jsonFieldEmpty: (v: unknown) => boolean;
  panelClassName: string;
  formatDate: (iso: string | null | undefined) => string;
  resetKey?: string;
};

export function isFeedbackRowEnabled(
  agent: Record<string, unknown>,
  row: AgentFeedbackRow,
  jsonFieldEmpty: (v: unknown) => boolean,
): boolean {
  return agent[row.hasField] === true && !jsonFieldEmpty(agent[row.summaryField]);
}

function summaryJson(
  agent: Record<string, unknown>,
  field: string,
  isEmpty: (v: unknown) => boolean,
): string | null {
  const raw = agent[field];
  if (isEmpty(raw)) return null;
  return JSON.stringify(raw, null, 2);
}

export function AgentFeedbackAccordion({
  agent,
  isDark,
  t,
  rows,
  expandedField,
  onExpandedChange,
  jsonFieldEmpty,
  panelClassName,
  formatDate,
  resetKey,
}: Props) {
  const enabledRows = useMemo(
    () => rows.filter((row) => isFeedbackRowEnabled(agent, row, jsonFieldEmpty)),
    [agent, rows, jsonFieldEmpty],
  );

  const itemBorder = isDark ? 'border-zinc-700/55' : 'border-zinc-200/80';
  const headerHover = isDark ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-100/80';
  const preClass = isDark ? 'text-gray-300' : 'text-zinc-800';
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';

  if (enabledRows.length === 0) {
    return <p className={`text-sm ${muted}`}>{t.agentDetailNoJsonToShow}</p>;
  }

  return (
    <div className="space-y-2">
      {enabledRows.map((row) => {
        const isExpanded = expandedField === row.summaryField;
        const bodyJson = summaryJson(agent, row.summaryField, jsonFieldEmpty);
        const commentsSummary =
          row.summaryField === 'comments_summary'
            ? parseCommentsSummary(agent[row.summaryField])
            : null;
        const attestationsSummary =
          row.summaryField === 'attestations_summary'
            ? parseAttestationsSummary(agent[row.summaryField])
            : null;
        const externalAuditSummary =
          row.summaryField === 'external_audit_summary'
            ? parseExternalAuditSummary(agent[row.summaryField])
            : null;
        const identityAnalysisSummary =
          row.summaryField === 'identity_analysis_summary'
            ? parseIdentityAnalysisSummary(agent[row.summaryField])
            : null;
        const onChainExecutionSummary =
          row.summaryField === 'on_chain_execution_summary'
            ? parseOnChainExecutionSummary(agent[row.summaryField])
            : null;
        const onChainFeedbackSummary =
          row.summaryField === 'on_chain_feedback_summary'
            ? parseOnChainFeedbackSummary(agent[row.summaryField])
            : null;
        const protocolActivitySummary =
          row.summaryField === 'protocol_activity_summary'
            ? parseProtocolActivitySummary(agent[row.summaryField])
            : null;

        const feedbackBody =
          row.summaryField === 'comments_summary' && commentsSummary ? (
            <AgentCommentsSummaryPanel
              summary={commentsSummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
            />
          ) : row.summaryField === 'attestations_summary' && attestationsSummary ? (
            <AgentAttestationsSummaryPanel
              summary={attestationsSummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
            />
          ) : row.summaryField === 'external_audit_summary' && externalAuditSummary ? (
            <AgentExternalAuditSummaryPanel
              summary={externalAuditSummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
              resetKey={resetKey}
            />
          ) : row.summaryField === 'identity_analysis_summary' && identityAnalysisSummary ? (
            <AgentIdentityAnalysisSummaryPanel
              summary={identityAnalysisSummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
            />
          ) : row.summaryField === 'on_chain_execution_summary' && onChainExecutionSummary ? (
            <AgentOnChainExecutionSummaryPanel
              summary={onChainExecutionSummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
              resetKey={resetKey}
            />
          ) : row.summaryField === 'on_chain_feedback_summary' && onChainFeedbackSummary ? (
            <AgentOnChainFeedbackSummaryPanel
              summary={onChainFeedbackSummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
              resetKey={resetKey}
            />
          ) : row.summaryField === 'protocol_activity_summary' && protocolActivitySummary ? (
            <AgentProtocolActivitySummaryPanel
              summary={protocolActivitySummary}
              isDark={isDark}
              t={t}
              formatDate={formatDate}
              resetKey={resetKey}
            />
          ) : (
            <pre className={cn('whitespace-pre-wrap font-mono text-sm', preClass)}>
              {bodyJson ?? t.agentDetailNoJsonToShow}
            </pre>
          );

        return (
          <div
            key={row.summaryField}
            className={cn('overflow-hidden rounded-2xl border', itemBorder)}
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => onExpandedChange(isExpanded ? null : row.summaryField)}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium transition-colors',
                headerHover,
                isDark ? 'text-zinc-200' : 'text-zinc-800',
              )}
            >
              <span>{t[row.labelKey]}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              )}
            </button>

            {isExpanded ? (
              <div className={cn('mx-3 mb-3 max-h-[520px] overflow-auto p-4', panelClassName)}>
                {feedbackBody}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
