import type { IndexHumiCardData } from '@/lib/indexHumi';
import type { HumiPillarId } from '@/lib/indexHumiPillars';

export type PillarSummaryBlockId = 'basic' | 'intermediate' | 'advanced';

export type PillarSummaryBlocks = {
  block_basic_score: number | null;
  block_intermediate_score: number | null;
  block_advanced_score: number | null;
};

export type PillarSummaryChartPoint = {
  blockId: PillarSummaryBlockId;
  label: string;
  value: number;
  max: number;
};

const BLOCK_MAX: Record<PillarSummaryBlockId, number> = {
  basic: 10,
  intermediate: 9,
  advanced: 6,
};

const BLOCK_ORDER: readonly PillarSummaryBlockId[] = ['basic', 'intermediate', 'advanced'];

export const PILLAR_SUMMARY_FIELDS: Record<
  HumiPillarId,
  keyof Pick<
    IndexHumiCardData,
    | 'pillar_history_summary'
    | 'pillar_usage_summary'
    | 'pillar_measure_summary'
    | 'pillar_information_summary'
  >
> = {
  history: 'pillar_history_summary',
  usage: 'pillar_usage_summary',
  measure: 'pillar_measure_summary',
  information: 'pillar_information_summary',
};

function finiteScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function clampBlockScore(value: unknown, max: number): number {
  const n = finiteScore(value);
  if (n === null) return 0;
  return Math.min(max, Math.max(0, n));
}

export function getPillarSummaryRaw(
  data: IndexHumiCardData | null,
  pillarId: HumiPillarId,
): unknown {
  if (!data) return null;
  const field = PILLAR_SUMMARY_FIELDS[pillarId];
  return data[field] ?? null;
}

export function isPillarSummaryMissing(raw: unknown): boolean {
  return raw === null || raw === undefined;
}

export function parsePillarSummary(raw: unknown): PillarSummaryBlocks | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  return {
    block_basic_score: clampBlockScore(o.block_basic_score, BLOCK_MAX.basic),
    block_intermediate_score: clampBlockScore(o.block_intermediate_score, BLOCK_MAX.intermediate),
    block_advanced_score: clampBlockScore(o.block_advanced_score, BLOCK_MAX.advanced),
  };
}

export function buildPillarSummaryChartPoints(
  blocks: PillarSummaryBlocks | null,
  labels: Record<PillarSummaryBlockId, string>,
): PillarSummaryChartPoint[] {
  if (!blocks) return [];

  const valueByBlock: Record<PillarSummaryBlockId, number> = {
    basic: blocks.block_basic_score ?? 0,
    intermediate: blocks.block_intermediate_score ?? 0,
    advanced: blocks.block_advanced_score ?? 0,
  };

  return BLOCK_ORDER.map((blockId) => ({
    blockId,
    label: labels[blockId],
    value: valueByBlock[blockId],
    max: BLOCK_MAX[blockId],
  }));
}

export function hasPillarSummaryChartData(points: PillarSummaryChartPoint[]): boolean {
  return points.length > 0;
}
