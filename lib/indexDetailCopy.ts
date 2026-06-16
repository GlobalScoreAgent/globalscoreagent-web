import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';

export type IndexDetailCopy = {
  trendTitle: string;
  trendScopeLabel: string;
  trendPeriodLabel: string;
  trendScopeIndex: string;
  trendScopePillar: string;
  chart30d: string;
  chartMonthly: string;
  chartEmpty: string;
  pillarTrendSelectPillar: string;
  pillarTrendNoDbData: string;
  vsPreviousLabel: string;
  pillarSummaryTitle: string;
  pillarSummaryNoData: string;
  pillarDetailsTitle: string;
  pillarDetailsSelectPillar: string;
  pillarDetailsNoData: string;
  pillarDetailsColInformation: string;
  pillarDetailsColDescription: string;
  pillarDetailsEmpty: string;
  blockDetailsTitle: string;
  blockDetailsSelectPillar: string;
  blockDetailsSelectBlock: string;
  blockDetailsNoItems: string;
  blockDetailsColItem: string;
  blockDetailsColBusiness: string;
  blockDetailsColReason: string;
  blockDetailsColItemDetails: string;
  blockDetailsColScore: string;
  blockDetailsTotalLabel: string;
  blockDetailsGenericDescription: string;
  blockDetailsReasonEmpty: string;
  blockDetailsItemDetailsEmpty: string;
  pillarBlockBasic: string;
  pillarBlockIntermediate: string;
  pillarBlockAdvanced: string;
  pillarsEmpty: string;
  pillarMax: string;
};

function fromHumi(t: Translations): IndexDetailCopy {
  return {
    trendTitle: t.agentHumiTrendTitle,
    trendScopeLabel: t.agentHumiTrendScopeLabel,
    trendPeriodLabel: t.agentHumiTrendPeriodLabel,
    trendScopeIndex: t.agentHumiTrendScopeIndex,
    trendScopePillar: t.agentHumiTrendScopePillar,
    chart30d: t.agentHumiChart30d,
    chartMonthly: t.agentHumiChartMonthly,
    chartEmpty: t.agentHumiChartEmpty,
    pillarTrendSelectPillar: t.agentHumiPillarTrendSelectPillar,
    pillarTrendNoDbData: t.agentHumiPillarTrendNoDbData,
    vsPreviousLabel: t.transactionalDeltaVsPrevious,
    pillarSummaryTitle: t.agentHumiPillarSummaryTitle,
    pillarSummaryNoData: t.agentHumiPillarSummaryNoData,
    pillarDetailsTitle: t.agentHumiPillarDetailsTitle,
    pillarDetailsSelectPillar: t.agentHumiPillarDetailsSelectPillar,
    pillarDetailsNoData: t.agentHumiPillarDetailsNoData,
    pillarDetailsColInformation: t.agentHumiPillarDetailsColInformation,
    pillarDetailsColDescription: t.agentHumiPillarDetailsColDescription,
    pillarDetailsEmpty: t.agentHumiPillarDetailsEmpty,
    blockDetailsTitle: t.agentHumiBlockDetailsTitle,
    blockDetailsSelectPillar: t.agentHumiBlockDetailsSelectPillar,
    blockDetailsSelectBlock: t.agentHumiBlockDetailsSelectBlock,
    blockDetailsNoItems: t.agentHumiBlockDetailsNoItems,
    blockDetailsColItem: t.agentHumiBlockDetailsColItem,
    blockDetailsColBusiness: t.agentHumiBlockDetailsColBusiness,
    blockDetailsColReason: t.agentHumiBlockDetailsColReason,
    blockDetailsColItemDetails: t.agentHumiBlockDetailsColItemDetails,
    blockDetailsColScore: t.agentHumiBlockDetailsColScore,
    blockDetailsTotalLabel: t.agentHumiBlockDetailsTotalLabel,
    blockDetailsGenericDescription: t.agentHumiBlockDetailsGenericDescription,
    blockDetailsReasonEmpty: t.agentHumiBlockDetailsReasonEmpty,
    blockDetailsItemDetailsEmpty: t.agentHumiBlockDetailsItemDetailsEmpty,
    pillarBlockBasic: t.agentHumiPillarBlockBasic,
    pillarBlockIntermediate: t.agentHumiPillarBlockIntermediate,
    pillarBlockAdvanced: t.agentHumiPillarBlockAdvanced,
    pillarsEmpty: t.agentHumiPillarsEmpty,
    pillarMax: t.agentHumiPillarMax,
  };
}

export function getHumiIndexDetailCopy(t: Translations): IndexDetailCopy {
  return fromHumi(t);
}

export function getWamiIndexDetailCopy(t: Translations): IndexDetailCopy {
  return {
    trendTitle: t.agentWamiTrendTitle,
    trendScopeLabel: t.agentWamiTrendScopeLabel,
    trendPeriodLabel: t.agentWamiTrendPeriodLabel,
    trendScopeIndex: t.agentWamiTrendScopeIndex,
    trendScopePillar: t.agentWamiTrendScopePillar,
    chart30d: t.agentWamiChart30d,
    chartMonthly: t.agentWamiChartMonthly,
    chartEmpty: t.agentWamiChartEmpty,
    pillarTrendSelectPillar: t.agentWamiPillarTrendSelectPillar,
    pillarTrendNoDbData: t.agentWamiPillarTrendNoDbData,
    vsPreviousLabel: t.transactionalDeltaVsPrevious,
    pillarSummaryTitle: t.agentWamiPillarSummaryTitle,
    pillarSummaryNoData: t.agentWamiPillarSummaryNoData,
    pillarDetailsTitle: t.agentWamiPillarDetailsTitle,
    pillarDetailsSelectPillar: t.agentWamiPillarDetailsSelectPillar,
    pillarDetailsNoData: t.agentWamiPillarDetailsNoData,
    pillarDetailsColInformation: t.agentWamiPillarDetailsColInformation,
    pillarDetailsColDescription: t.agentWamiPillarDetailsColDescription,
    pillarDetailsEmpty: t.agentWamiPillarDetailsEmpty,
    blockDetailsTitle: t.agentWamiBlockDetailsTitle,
    blockDetailsSelectPillar: t.agentWamiBlockDetailsSelectPillar,
    blockDetailsSelectBlock: t.agentWamiBlockDetailsSelectBlock,
    blockDetailsNoItems: t.agentWamiBlockDetailsNoItems,
    blockDetailsColItem: t.agentWamiBlockDetailsColItem,
    blockDetailsColBusiness: t.agentWamiBlockDetailsColBusiness,
    blockDetailsColReason: t.agentWamiBlockDetailsColReason,
    blockDetailsColItemDetails: t.agentWamiBlockDetailsColItemDetails,
    blockDetailsColScore: t.agentWamiBlockDetailsColScore,
    blockDetailsTotalLabel: t.agentWamiBlockDetailsTotalLabel,
    blockDetailsGenericDescription: t.agentWamiBlockDetailsGenericDescription,
    blockDetailsReasonEmpty: t.agentWamiBlockDetailsReasonEmpty,
    blockDetailsItemDetailsEmpty: t.agentWamiBlockDetailsItemDetailsEmpty,
    pillarBlockBasic: t.agentWamiPillarBlockBasic,
    pillarBlockIntermediate: t.agentWamiPillarBlockIntermediate,
    pillarBlockAdvanced: t.agentWamiPillarBlockAdvanced,
    pillarsEmpty: t.agentWamiPillarsEmpty,
    pillarMax: t.agentWamiPillarMax,
  };
}
