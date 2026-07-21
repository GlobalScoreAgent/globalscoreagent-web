// app/(dashboard)/dashboard/components/LanguageContext.tsx
// Contexto combinado: Idioma + Tema Claro/Oscuro

'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'es' | 'en';
type Theme = 'dark' | 'light';

export interface Translations {
  // Sidebar
  home: string;
  blockchains: string;
  agentsDirectory: string;
  walcert: string;
  humiIndex: string;
  certifications: string;
  roadMap: string;
  roadMapLine1: string;
  roadMapLine2: string;
  roadMapExpandAria: string;
  roadMapCollapseAria: string;
  cerex: string;
  cerow: string;
  logout: string;

  // Platform
  platformTitle: string;

  // Top Nav
  dashboardTitle: string;
  searchPlaceholder: string;
  searchAction: string;
  profile: string;
  subscriptions: string;
  api: string;
  signOut: string;
  subscriptionsPageTitle: string;
  apiPageTitle: string;
  apiCreditsTitle: string;
  apiCreditsLoading: string;
  apiCreditsEmpty: string;
  apiCreditsType: string;
  apiCreditsAmount: string;
  apiCreditsValidFrom: string;
  apiCreditsValidTo: string;
  newsTickerEmpty: string;
  feedbacks: string;
  feedbacksPageTitle: string;
  feedbacksHistoryTitle: string;
  feedbacksNewTitle: string;
  feedbacksEmpty: string;
  feedbacksType: string;
  feedbacksMessage: string;
  feedbacksDate: string;
  feedbacksGsaReply: string;
  feedbacksTypePlaceholder: string;
  feedbacksMessagePlaceholder: string;
  feedbacksSave: string;
  feedbacksSaving: string;
  feedbacksSaved: string;
  feedbacksLoading: string;
  feedbacksInvalidForm: string;
  subscriptionsActiveTitle: string;
  subscriptionsHistoryTitle: string;
  subscriptionsPlanColumn: string;
  subscriptionsStatusColumn: string;
  subscriptionsPeriodStartColumn: string;
  subscriptionsPeriodEndColumn: string;
  subscriptionsCreatedColumn: string;
  subscriptionsActiveBadge: string;
  subscriptionsNoActive: string;
  subscriptionInactiveBadge: string;
  subscriptionInactiveVideoLabel: string;
  subscriptionsNoHistory: string;
  subscriptionsPlansBilling: string;
  subscriptionsLoading: string;
  subscriptionsAvailablePlansTitle: string;
  subscriptionsSoonBadge: string;
  subscriptionsSubscribe: string;
  subscriptionsSubscribeLoading: string;
  subscriptionsCheckoutError: string;
  subscriptionsCheckoutEmailSent: string;
  subscriptionsCheckoutMissingSubscription: string;
  subscriptionsCurrentPlan: string;
  subscriptionsMoreDetailsTitle: string;
  subscriptionsMonthlyLabel: string;
  subscriptionsAnnualLabel: string;
  subscriptionsSavingsLabel: string;
  subscriptionsIncludesLabel: string;
  subscriptionsDaysValidLabel: string;
  subscriptionsApiCreditsLabel: string;
  subscriptionsPriceLabel: string;
  subscriptionsDiscountLabel: string;
  subscriptionsNoPlansAvailable: string;
  subscriptionTagLabel: string;
  subscriptionPeriodStart: string;
  subscriptionPeriodEnd: string;

  // Página principal
  welcomeTitle: string;
  welcomeSubtitle: string;
  registeredAgents: string;
  activeAgents: string;
  agentsWithFeedback: string;
  monitoredWallets: string;
  dashboardKpiOwnerTotal: string;
  dashboardKpiAgentNew: string;
  dashboardKpiFeedbackNew: string;
  dashboardKpiAgentsWithFeedback: string;
  dashboardKpiFeedbackTotal: string;
  humiDistributionTitle: string;
  distributionDonutTotalLabel: string;
  distributionDonutSegmentsLabel: string;
  cerowTitle: string;           // ← Nuevo
  cerexTitle: string;           // ← Nuevo
  comingSoon: string;           // ← Nuevo
  dashboardOverviewTitle: string;
  agentOverviewTitle: string;
  humiElite: string;
  humiVeryStable: string;
  humiStable: string;
  humiDeveloping: string;
  humiUnstable: string;
  humiNotCalculate: string;
  humiHighPerformance: string;
  humiModerateRisk: string;
  humiCritical: string;

  // Dashboard - Cards y elementos
  humiIndexTitle: string;
  metadataRichnessTitle: string;
  wamiDistributionTitle: string;
  dashboardOverviewDistributionTitle: string;
  /** Overview top-10 card badge (global ecosystem) */
  dashboardOverviewTop10Badge: string;
  monitoredChainsTitle: string;
  agentNonceTitle: string;
  /** Insight card: Agent Nonce section title including 30-day window */
  dashboardInsightNonceBadge: string;
  /** Insight card top badge: ecosystem overview */
  dashboardInsightEcosystemBadge: string;
  last30DaysTitle: string;
  totalLabel: string;
  nonceLabel: string;
  agentsLabel: string;
  ownersLabel: string;
  activeLabel: string;
  feedbacksLabel: string;

  // Dashboard - Descripciones
  totalAgentsDescription: string;
  activeAgentsDescription: string;
  agentsWithFeedbackDescription: string;
  monitoredWalletsDescription: string;
  erc8004Label: string;
  realTimeLabel: string;

  // Dashboard - Tooltips
  agentsTooltip: string;
  noncesTooltip: string;

  // Dashboard - Categorías Metadata
    metadataExcellent: string;
    metadataStrong: string;
    metadataModerate: string;
    metadataBasic: string;
    metadataLimited: string;
    metadataIncomplete: string;
    metadataElite: string;
    metadataGood: string;
    metadataRegular: string;
    metadataLow: string;
    metadataPoor: string;
    averageLabel: string;

  // Agentes - Opciones de búsqueda
  searchGeneral: string;
  searchNetwork: string;
  searchName: string;
  searchDescription: string;
  searchWallet: string;
  searchWalletOwner: string;
  searchAgentIdentifier: string;
  searchMetadata: string;
  searchSupportedTrust: string;
  searchSkills: string;
  searchCapabilities: string;
  searchTags: string;
  searchOasfSkills: string;
  searchOasfDomains: string;
  searchTechnicalTools: string;
  searchTechnicalPrompts: string;
  searchTechnicalCapabilities: string;
  searchServices: string;

  // Agentes - Filtros específicos
  selectCategory: string;
  searchCategories: string;
  searchSubcategories: string;

  // Agentes - Etiquetas de tarjetas
  humiScoreLabel: string;
  humiScoreShort: string;

  // Agentes - Ordenamiento
  sortByLabel: string;
  sortLabel: string;
  sortName: string;
  sortCreatedDate: string;
  sortHumiScore: string;
  sortNonce: string;
  sortBalance: string;

  // Agentes - Paginación
  previous: string;
  next: string;
  show: string;
  agentsPerPage: string;

  // Agentes - Estados vacíos
  noTags: string;
  noSkills: string;

  // Agentes - Tooltips
  clearFiltersTooltip: string;
  searchLoadingAgents: string;
  searchUpdatingResults: string;
  searchLoadErrorGeneric: string;
  searchLoadErrorServer: string;
  searchRetry: string;
  hideAdvancedFilter: string;
  addFilter: string;
  clearAllFilters: string;
  resultsLabel: string;
  activeFiltersLabel: string;
  advancedFilterLabel: string;
  searchCategoryPlaceholder: string;
  selectValuePlaceholder: string;
  searchSubcategoryPlaceholder: string;
  simpleFilterHint: string;
  searchChipLabel: string;
  searchTypeChipLabel: string;
  noAgentsFound: string;
  sortAscending: string;
  sortDescending: string;
  notAvailable: string;
  noDescription: string;
  agentLabel: string;
  ownerLabel: string;
  nonceValueLabel: string;
  skillsLabel: string;
  capabilitiesLabel: string;
  dummyLabel: string;
  duplicateLabel: string;
  aiCategoryPrimaryLabel: string;
  aiCategorySecondaryLabel: string;
  aiCategoryConfidenceLabel: string;
  aiCategoryPurposeLabel: string;
  aiCategoryAnalyzingLabel: string;
  agentsDirectoryAiCategoryLabel: string;
  agentsDirectoryAiAnalysisLabel: string;

  // Sidebar - Recientes agentes
  recentAgentsSubmenu: string;
  favoriteAgentsSubmenu: string;
  closeSidebarAgent: string;
  favoriteAgent: string;
  unfavoriteAgent: string;
  agentMenuAria: string;

  // Agent detail page
  agentDetailLoadError: string;
  agentDetailLoading: string;
  agentDetailHumiScoreLabel: string;
  agentDetailWamiScoreLabel: string;
  agentDetailIndexHumiTitle: string;
  agentDetailIndexWamiTitle: string;
  agentDetailIndexInfoAriaLabel: string;
  agentDetailIndexHumiHelp: string;
  agentDetailIndexWamiHelp: string;
  agentDetailViewDetails: string;
  agentDetailIndexPlusAriaLabelHumi: string;
  agentDetailIndexPlusAriaLabelWami: string;
  agentDetailRealnessTitle: string;
  agentDetailRealnessHelp: string;
  agentDetailRealnessInfoAriaLabel: string;
  realnessStatusValid: string;
  realnessStatusInsufficientInfo: string;
  realnessStatusDummy: string;
  realnessStatusTest: string;
  realnessBusinessMeaningValid: string;
  realnessBusinessMeaningInsufficientInfo: string;
  realnessBusinessMeaningDummy: string;
  realnessBusinessMeaningTest: string;
  realnessStatusInfoAriaLabel: string;
  agentHumiBackToOverview: string;
  agentHumiMissingAgentId: string;
  agentHumiGoToDirectory: string;
  agentHumiCalculatedAt: string;
  agentHumiIndexScoreTitle: string;
  agentHumiPageTitleSuffix: string;
  agentHumiChartTitle: string;
  agentHumiTrendTitle: string;
  agentHumiTrendScopeLabel: string;
  agentHumiTrendPeriodLabel: string;
  agentHumiTrendScopeIndex: string;
  agentHumiTrendScopePillar: string;
  agentHumiPillarDetailsTitle: string;
  agentHumiPillarDetailsSelectPillar: string;
  agentHumiPillarDetailsNoData: string;
  agentHumiPillarDetailsColInformation: string;
  agentHumiPillarDetailsColDescription: string;
  agentHumiPillarDetailsEmpty: string;
  agentHumiPillarDetailsKeyStrengths: string;
  agentHumiPillarDetailsMainConcerns: string;
  agentHumiPillarDetailsRecommendation: string;
  agentHumiPillarDetailsOverallAssessment: string;
  agentHumiPillarDetailsBusinessInterpretation: string;
  agentHumiChart30d: string;
  agentHumiChartMonthly: string;
  agentHumiChartEmpty: string;
  agentHumiPillarsTitle: string;
  agentHumiPillarHistory: string;
  agentHumiPillarUsage: string;
  agentHumiPillarMeasure: string;
  agentHumiPillarInformation: string;
  agentHumiPillarsEmpty: string;
  agentHumiPillarMax: string;
  agentHumiPillarTrendTitle: string;
  agentHumiPillarTrendNoDbData: string;
  agentHumiPillarTrendSelectPillar: string;
  agentHumiPillarSummaryTitle: string;
  agentHumiPillarBlockBasic: string;
  agentHumiPillarBlockIntermediate: string;
  agentHumiPillarBlockAdvanced: string;
  agentHumiPillarSummaryNoData: string;
  agentHumiBlockDetailsTitle: string;
  agentHumiBlockDetailsSelectPillar: string;
  agentHumiBlockDetailsSelectBlock: string;
  agentHumiBlockDetailsNoItems: string;
  agentHumiBlockDetailsColItem: string;
  agentHumiBlockDetailsColBusiness: string;
  agentHumiBlockDetailsColReason: string;
  agentHumiBlockDetailsColItemDetails: string;
  agentHumiBlockDetailsColScore: string;
  agentHumiBlockDetailsGenericDescription: string;
  agentHumiBlockDetailsReasonEmpty: string;
  agentHumiBlockDetailsItemDetailsEmpty: string;
    agentHumiBlockDetailsTotalLabel: string;
  agentWamiBackToOverview: string;
  agentWamiMissingAgentId: string;
  agentWamiGoToDirectory: string;
  agentWamiCalculatedAt: string;
  agentWamiPageTitleSuffix: string;
  agentWamiAgentSummaryTitle: string;
  agentWamiWalletAnalysisTitle: string;
  agentWamiWalletMaturityLabel: string;
  agentWamiWalletPillarsTitle: string;
  agentWamiWalletCarouselLabel: string;
  agentWamiWalletCarouselPrev: string;
  agentWamiWalletCarouselNext: string;
  agentWamiWalletCarouselEmpty: string;
  agentWamiWalletCarouselCopy: string;
  agentWamiWalletCarouselCopied: string;
  agentWamiTrendTitle: string;
  agentWamiTrendScopeLabel: string;
  agentWamiTrendPeriodLabel: string;
  agentWamiTrendScopeIndex: string;
  agentWamiTrendScopePillar: string;
  agentWamiPillarDetailsTitle: string;
  agentWamiPillarDetailsSelectPillar: string;
  agentWamiPillarDetailsNoData: string;
  agentWamiPillarDetailsColInformation: string;
  agentWamiPillarDetailsColDescription: string;
  agentWamiPillarDetailsEmpty: string;
  agentWamiPillarDetailsKeyStrengths: string;
  agentWamiPillarDetailsMainConcerns: string;
  agentWamiPillarDetailsRecommendation: string;
  agentWamiPillarDetailsOverallAssessment: string;
  agentWamiPillarDetailsBusinessInterpretation: string;
  agentWamiChart30d: string;
  agentWamiChartMonthly: string;
  agentWamiChartEmpty: string;
  agentWamiPillarOrigins: string;
  agentWamiPillarPortfolio: string;
  agentWamiPillarActivity: string;
  agentWamiPillarMultichain: string;
  agentWamiPillarsEmpty: string;
  agentWamiPillarMax: string;
  agentWamiPillarTrendNoDbData: string;
  agentWamiPillarTrendSelectPillar: string;
  agentWamiPillarSummaryTitle: string;
  agentWamiPillarBlockBasic: string;
  agentWamiPillarBlockIntermediate: string;
  agentWamiPillarBlockAdvanced: string;
  agentWamiPillarSummaryNoData: string;
  agentWamiBlockDetailsTitle: string;
  agentWamiBlockDetailsSelectPillar: string;
  agentWamiBlockDetailsSelectBlock: string;
  agentWamiBlockDetailsNoItems: string;
  agentWamiBlockDetailsColItem: string;
  agentWamiBlockDetailsColBusiness: string;
  agentWamiBlockDetailsColReason: string;
  agentWamiBlockDetailsColItemDetails: string;
  agentWamiBlockDetailsColScore: string;
  agentWamiBlockDetailsGenericDescription: string;
  agentWamiBlockDetailsReasonEmpty: string;
  agentWamiBlockDetailsItemDetailsEmpty: string;
  agentWamiBlockDetailsTotalLabel: string;
  agentDetailWeb: string;
  agentDetailEmail: string;
  readMoreDescription: string;
  descriptionModalTitle: string;
  closeModal: string;
  agentDetailOnChainData: string;
  agentDetailChainLabel: string;
  agentDetailWalletOnChainIdInfo: string;
  agentDetailCreatedAt: string;
  agentDetailOwnerChanges: string;
  agentDetailOwnerWallet: string;
  agentDetailOwnerSince: string;
  agentDetailOwnerCardTitle: string;
  agentDetailOwnerActivityTitle: string;
  agentDetailOwnerFirstActivity: string;
  agentDetailOwnerWalletTypeActive: string;
  agentDetailOwnerWalletTypeHolder: string;
  agentDetailOwnerWalletTypeActiveHelp: string;
  agentDetailOwnerWalletTypeHolderHelp: string;
  agentDetailOwnerWalletTypeInfoAriaLabel: string;
  agentDetailOwnerActivityEmpty: string;
  agentDetailOwnerActivityPrev: string;
  agentDetailOwnerActivityNext: string;
  agentDetailMetadataInformation: string;
  agentDetailTransactionalData: string;
  agentDetailTransactionalWalletTitle: string;
  agentDetailWalletDetailsTitle: string;
  agentDetailTransactionalWalletPrev: string;
  agentDetailTransactionalWalletNext: string;
  agentDetailTransactionalWalletEmpty: string;
  agentDetailTransactionalWalletWamiLabel: string;
  agentDetailTransactionalWalletCategoryLabel: string;
  agentDetailWalletCategoryInfoAriaLabel: string;
  agentDetailWalletCategoryExplanationFallback: string;
  agentDetailFeedbackData: string;
  transactionalTabNonce: string;
  transactionalTabBalance: string;
  transactionalNonceCurrentLabel: string;
  transactionalBalanceCurrentLabel: string;
  transactionalNonceCurrentHelp: string;
  transactionalBalanceCurrentHelp: string;
  transactionalNonceInfoAriaLabel: string;
  transactionalBalanceInfoAriaLabel: string;
  transactionalChainFilterAll: string;
  transactionalBalanceMultiChainLabel: string;
  transactionalBalanceMultiChainHelp: string;
  metadataTabSkills: string;
  metadataTabSupportedTrust: string;
  metadataTabCapabilities: string;
  metadataTabTags: string;
  metadataTabOasfSkills: string;
  metadataTabOasfDomains: string;
  metadataTabTechnicalTools: string;
  metadataTabTechnicalPrompts: string;
  metadataTabTechnicalCapabilities: string;
  metadataTabServices: string;
  metadataX402Enabled: string;
  metadataX402Disabled: string;
  agentDetailMetadataViewAnalysis: string;
  agentDetailMetadataViewData: string;
  agentDetailMetadataRichnessScoreLabel: string;
  agentDetailRichnessScoreLabel: string;
  agentDetailRichnessScoreHelp: string;
  agentDetailRichnessScoreInfoAriaLabel: string;
  agentDetailMetadataRichnessTotalLabel: string;
  agentDetailMetadataRichnessCalculatedAt: string;
  agentDetailMetadataLayerRangeBasic: string;
  agentDetailMetadataLayerRangeIntermediate: string;
  agentDetailMetadataLayerRangeAdvanced: string;
  agentDetailMetadataLayerBasic: string;
  agentDetailMetadataLayerIntermediate: string;
  agentDetailMetadataLayerAdvanced: string;
  agentDetailMetadataRichnessEmpty: string;
  agentDetailMetadataRichnessHoverPlaceholder: string;
  agentDetailMetadataLayerNoBreakdown: string;
  agentDetailMetadataLayerPrev: string;
  agentDetailMetadataLayerNext: string;
  agentDetailMetadataLayerRemaining: string;
  agentDetailMetadataLayerRemainingHelp: string;
  agentDetailMetadataItemExplanationFallback: string;
  agentDetailMetadataItemInfoAriaLabel: string;
  feedbackAxisCommentQuality: string;
  feedbackAxisAttestationQuality: string;
  feedbackAxisFeedbackVolume: string;
  feedbackAxisProtocolActivity: string;
  feedbackAxisExecutionSuccess: string;
  feedbackAxisAttestationValidity: string;
  feedbackAxisPaidProtocolActivity: string;
  feedbackAxisFreshness: string;
  agentDetailFeedbackAnalysisEmpty: string;
  /** Feedback radar: scale hint with `{max}` placeholder */
  agentDetailFeedbackRadarScale: string;
  /** Feedback radar title: `{avg}` formatted mean, `{n}` axis count */
  agentDetailFeedbackRadarStrengthTitle: string;
  feedbackTabComments: string;
  feedbackTabAttestations: string;
  feedbackTabExternalAudit: string;
  feedbackTabIdentityAnalysis: string;
  feedbackTabOnChainExecutions: string;
  feedbackTabOnChainFeedbacks: string;
  feedbackTabProtocolActivity: string;
  agentDetailCommentsPieValid: string;
  agentDetailCommentsPieRevoked: string;
  agentDetailCommentsPieOther: string;
  agentDetailCommentsTotal: string;
  agentDetailCommentsRatio: string;
  agentDetailCommentsLastRecord: string;
  agentDetailAttestationsPieValid: string;
  agentDetailAttestationsPieSpam: string;
  agentDetailAttestationsPieRevoked: string;
  agentDetailAttestationsPieOther: string;
  agentDetailAttestationsTotal: string;
  agentDetailAttestationsRate: string;
  agentDetailAttestationsScoreAvg: string;
  agentDetailAttestationsLastRecord: string;
  agentDetailExternalAuditSourcesTitle: string;
  agentDetailExternalAuditEntityLabel: string;
  agentDetailExternalAuditScoreLabel: string;
  agentDetailExternalAuditLastAtLabel: string;
  agentDetailExternalAuditPrev: string;
  agentDetailExternalAuditNext: string;
  agentDetailExternalAuditEmpty: string;
  agentDetailExternalAuditSourceCount: string;
  agentDetailExternalAuditGlobalScore: string;
  agentDetailExternalAuditLastRecord: string;
  agentDetailIdentityScore: string;
  agentDetailIdentityStage: string;
  agentDetailIdentityLastRecord: string;
  agentDetailOnChainExecutionCategoriesTitle: string;
  agentDetailOnChainExecutionCategoryLabel: string;
  agentDetailOnChainExecutionCountLabel: string;
  agentDetailOnChainExecutionLastAtLabel: string;
  agentDetailOnChainExecutionPrev: string;
  agentDetailOnChainExecutionNext: string;
  agentDetailOnChainExecutionEmpty: string;
  agentDetailOnChainExecutionTotal: string;
  agentDetailOnChainExecutionRate: string;
  agentDetailOnChainExecutionLastRecord: string;
  agentDetailOnChainFeedbackItemsTitle: string;
  agentDetailOnChainFeedbackCategoryLabel: string;
  agentDetailOnChainFeedbackSubcategoryLabel: string;
  agentDetailOnChainFeedbackAvgScoreLabel: string;
  agentDetailOnChainFeedbackPrev: string;
  agentDetailOnChainFeedbackNext: string;
  agentDetailOnChainFeedbackEmpty: string;
  agentDetailOnChainFeedbackTotal: string;
  agentDetailOnChainFeedbackRate: string;
  agentDetailOnChainFeedbackLastRecord: string;
  agentDetailProtocolActivityItemsTitle: string;
  agentDetailProtocolActivityEntityLabel: string;
  agentDetailProtocolActivityActivityLabel: string;
  agentDetailProtocolActivityCountLabel: string;
  agentDetailProtocolActivityAvgScoreLabel: string;
  agentDetailProtocolActivityRevokeCountLabel: string;
  agentDetailProtocolActivityPaymentCountLabel: string;
  agentDetailProtocolActivitySlideValidRateLabel: string;
  agentDetailProtocolActivitySlidePaymentRateLabel: string;
  agentDetailProtocolActivityLastAtLabel: string;
  agentDetailProtocolActivityPrev: string;
  agentDetailProtocolActivityNext: string;
  agentDetailProtocolActivityEmpty: string;
  agentDetailProtocolActivityTotal: string;
  agentDetailProtocolActivityGlobalScore: string;
  agentDetailProtocolActivityGlobalValidRate: string;
  agentDetailProtocolActivityGlobalPaymentRate: string;
  agentDetailProtocolActivityLastRecord: string;
  agentDetailCopied: string;
  agentDetailNoJsonToShow: string;
  chartLabelToday: string;
  chartLabel7d: string;
  chartLabel15d: string;
  chartLabel1m: string;
  chartLabel2m: string;
  chartLabel3m: string;
  chartLabel6m: string;
  chartLabel9m: string;
  chartLabel12m: string;
  agentDetailProfilesCardTitle: string;
  agentDetailWarningsTitle: string;
  agentDetailAiAnalysisTitle: string;
  agentDetailWarningsEmpty: string;
  agentDetailWarningInfoAriaLabel: string;
  agentDetailWarningDuplicationMetadataHelp: string;
  agentDetailWarningMultiAgentWalletHelp: string;
  agentDetailWarningDummyMetadataHelp: string;
  agentDetailWarningAttestationsSpamHelp: string;
  agentDetailWarningExternalAuditWarningHelp: string;
  agentDetailWarningHighRevocationsHelp: string;
  agentDetailWarningOwnerInactiveAgentsHelp: string;
  agentDetailWarningHighOwnershipChurnHelp: string;
  agentDetailWarningTransactionalWalletSameAsOwnerHelp: string;
  agentDetailWarningLowerRealnessHelp: string;
  agentDetailWarningLowerMetadataRichnessHelp: string;
  governanceTypeLabel: string;
  transactionalDeltaVsPrevious: string;

  // Dashboard — chains (dynamic cards)
  dashboardChainsEmpty: string;
  dashboardDataLoading: string;
  dashboardDataLoadError: string;
  dashboardDataRetry: string;
  chainSectionLast30Days: string;
  chainSectionOwners: string;
  chainSectionAgentInformation: string;
  chainSectionTechnicalMaturity: string;
  chainPctX402: string;
  chainPctMcpA2a: string;
  chainSectionWarnings: string;
  chainPctSpam: string;
  chainPctDuplicates: string;
  chainOnChainExecutions30d: string;
  chainOnChainPayments30d: string;
  chainOnChainProtocolActivity30d: string;
  chainStatPctActive: string;
  chainStatNewAgents30d: string;
  chainStatPctWalletActivity: string;
  chainStatPctOnchainActivity: string;
  chainOwnerTotal: string;
  chainAvgAgentsPerOwner: string;
  chainChartMonthlyTitle: string;
  chainChartHumiDistributionTitle: string;
  chainChartMetadataDistributionTitle: string;
  chainDistributionRailHumi: string;
  chainDistributionRailMetadata: string;
  chainDistributionRailWami: string;
  chainSectionDistribution: string;
  chainDistributionPrev: string;
  chainDistributionNext: string;
  chainTop10HumiTitle: string;
  chainTop10HumiEmpty: string;
  chainWarningDummyMetadata: string;
  chainWarningLowerRealness: string;
  chainWarningLowerMetadataRichness: string;
  chainWarningDuplicationMetadata: string;
  chainWarningMultiAgentWallet: string;
  chainWarningTransactionalWalletSameAsOwner: string;
  chainWarningOwnerInactiveAgents: string;
  chainWarningHighOwnershipChurn: string;
  chainWarningAttestationsSpam: string;
  chainWarningHighRevocations: string;
  chainWarningExternalAuditWarning: string;
  chainWarningDummyMetadataHelp: string;
  chainWarningLowerRealnessHelp: string;
  chainWarningLowerMetadataRichnessHelp: string;
  chainWarningDuplicationMetadataHelp: string;
  chainWarningMultiAgentWalletHelp: string;
  chainWarningTransactionalWalletSameAsOwnerHelp: string;
  chainWarningOwnerInactiveAgentsHelp: string;
  chainWarningHighOwnershipChurnHelp: string;
  chainWarningAttestationsSpamHelp: string;
  chainWarningHighRevocationsHelp: string;
  chainWarningExternalAuditWarningHelp: string;
  chainWarningInfoAriaLabel: string;
  chainDataUpdatedLabel: string;
  chainSeriesNewAgents: string;
  chainSeriesTotalAgents: string;
  chainSeriesActiveAgents: string;
}

const translations: Record<Language, Translations> = {
  es: {
    home: 'Inicio',
    blockchains: 'Cadenas',
    agentsDirectory: 'Directorio de Agentes',
    walcert: 'Agent Walcert',
    humiIndex: 'Índice HUMI',
    certifications: 'Certificaciones',
    roadMap: 'Próximas Funcionalidades',
    roadMapLine1: 'Próximas',
    roadMapLine2: 'Funcionalidades',
    roadMapExpandAria: 'Expandir próximas funcionalidades',
    roadMapCollapseAria: 'Contraer próximas funcionalidades',
    cerex: 'CEREX',
    cerow: 'CEROW',
    logout: 'Cerrar Sesión',

    dashboardTitle: 'Dashboard',
    platformTitle: 'GSA Plataforma',
    searchPlaceholder: 'Buscar agentes...',
    searchAction: 'Buscar',
    profile: 'Perfil',
    subscriptions: 'Subscripciones',
    api: 'API',
    signOut: 'Cerrar sesión',
    subscriptionsPageTitle: 'Subscripciones',
    apiPageTitle: 'API',
    apiCreditsTitle: 'Créditos API',
    apiCreditsLoading: 'Cargando créditos...',
    apiCreditsEmpty: 'No tienes créditos API registrados.',
    apiCreditsType: 'Tipo',
    apiCreditsAmount: 'Créditos disponibles',
    apiCreditsValidFrom: 'Válido desde',
    apiCreditsValidTo: 'Válido hasta',
    newsTickerEmpty: 'No hay noticias activas en este momento.',
    feedbacks: 'Comentarios',
    feedbacksPageTitle: 'Comentarios',
    feedbacksHistoryTitle: 'Mis comentarios',
    feedbacksNewTitle: 'Nuevo comentario',
    feedbacksEmpty: 'No has enviado comentarios aún.',
    feedbacksType: 'Tipo',
    feedbacksMessage: 'Mensaje',
    feedbacksDate: 'Fecha',
    feedbacksGsaReply: 'Respuesta GSA',
    feedbacksTypePlaceholder: 'Selecciona un tipo',
    feedbacksMessagePlaceholder: 'Escribe tu comentario...',
    feedbacksSave: 'Enviar comentario',
    feedbacksSaving: 'Enviando...',
    feedbacksSaved: 'Comentario enviado correctamente.',
    feedbacksLoading: 'Cargando comentarios...',
    feedbacksInvalidForm: 'Selecciona un tipo y escribe un mensaje.',
    subscriptionsActiveTitle: 'Suscripción activa',
    subscriptionsHistoryTitle: 'Historial de subscripciones',
    subscriptionsPlanColumn: 'Plan',
    subscriptionsStatusColumn: 'Estado',
    subscriptionsPeriodStartColumn: 'Inicio periodo',
    subscriptionsPeriodEndColumn: 'Fin periodo',
    subscriptionsCreatedColumn: 'Alta',
    subscriptionsActiveBadge: 'Activa',
    subscriptionsNoActive: 'No tienes una suscripción activa.',
    subscriptionInactiveBadge: 'El perfil no tiene una suscripción activa',
    subscriptionInactiveVideoLabel: 'Animación de suscripción inactiva',
    subscriptionsNoHistory: 'No hay subscripciones en el historial.',
    subscriptionsPlansBilling: 'Planes y pagos',
    subscriptionsLoading: 'Cargando subscripciones...',
    subscriptionsAvailablePlansTitle: 'Planes disponibles',
    subscriptionsSoonBadge: 'Próximamente',
    subscriptionsSubscribe: 'Contratar',
    subscriptionsSubscribeLoading: 'Procesando…',
    subscriptionsCheckoutError: 'No se pudo iniciar el pago. Inténtalo de nuevo.',
    subscriptionsCheckoutEmailSent:
      'Suscripción iniciada. Revisa tu email para completar el pago en NOWPayments.',
    subscriptionsCheckoutMissingSubscription:
      'No hay una suscripción activa para iniciar el pago.',
    subscriptionsCurrentPlan: 'Tu plan actual',
    subscriptionsMoreDetailsTitle: 'Más detalles',
    subscriptionsMonthlyLabel: 'Mensual',
    subscriptionsAnnualLabel: 'Anual',
    subscriptionsSavingsLabel: 'Ahorro',
    subscriptionsIncludesLabel: 'Qué incluye',
    subscriptionsDaysValidLabel: 'Días de validez',
    subscriptionsApiCreditsLabel: 'Créditos API mensuales',
    subscriptionsPriceLabel: 'Precio',
    subscriptionsDiscountLabel: 'Descuento',
    subscriptionsNoPlansAvailable: 'No hay planes disponibles en este momento.',
    subscriptionTagLabel: 'Suscripción',
    subscriptionPeriodStart: 'Inicio',
    subscriptionPeriodEnd: 'Fin',

    welcomeTitle: 'Bienvenido!',
    welcomeSubtitle: 'Resumen General Ecosistema ERC-8004',
    registeredAgents: 'Agentes Registrados',
    activeAgents: 'Agentes Activos',
    agentsWithFeedback: 'Agentes con Feedback',
    monitoredWallets: 'Wallets Monitoreadas',
    dashboardKpiOwnerTotal: 'Propietarios totales',
    dashboardKpiAgentNew: 'Agentes nuevos',
    dashboardKpiFeedbackNew: 'Feedbacks nuevos',
    dashboardKpiAgentsWithFeedback: 'Agentes con feedback',
    dashboardKpiFeedbackTotal: 'Feedbacks totales',
    humiDistributionTitle: 'Distribución Índice HUMI',
    distributionDonutTotalLabel: 'Total',
    distributionDonutSegmentsLabel: 'segmentos',
    cerowTitle: 'Certificado de Owner',
    cerexTitle: 'Certificado de Existencia',
    comingSoon: 'Próximamente',
    dashboardOverviewTitle: 'Resumen General Ecosistema ERC-8004',
    agentOverviewTitle: 'Vista General',
    humiElite: 'Elite',
    humiVeryStable: 'Muy estable',
    humiStable: 'Estable',
    humiDeveloping: 'En desarrollo',
    humiUnstable: 'Inestable',
    humiNotCalculate: 'Sin calcular',
    humiHighPerformance: 'Alto Rendimiento',
    humiModerateRisk: 'Riesgo Moderado',
    humiCritical: 'Críticos',

    // Dashboard - Cards y elementos
    humiIndexTitle: 'Indice',
    metadataRichnessTitle: 'Riqueza Metadata',
    wamiDistributionTitle: 'Distribución Índice WAMI',
    dashboardOverviewDistributionTitle: 'Distribución global',
    dashboardOverviewTop10Badge: 'Top 10 ecosistema',
    monitoredChainsTitle: 'Cadenas monitoreadas',
    agentNonceTitle: 'Agente Nonce',
    dashboardInsightNonceBadge: 'Agente Nonce - Últimos 30 días',
    dashboardInsightEcosystemBadge: 'Nonce diario (últimos 30 días)',
    last30DaysTitle: 'Ultimos 30 dias',
    totalLabel: 'Total',
    nonceLabel: 'nonce',
    agentsLabel: 'Agentes',
    ownersLabel: 'Owners',
    activeLabel: 'Activos',
    feedbacksLabel: 'Feedbacks',

    // Dashboard - Descripciones
    totalAgentsDescription: 'Total de agentes registrados en ERC-8004',
    activeAgentsDescription: 'Agentes con actividad reciente',
    agentsWithFeedbackDescription: 'Agentes con retroalimentación',
    monitoredWalletsDescription: 'Wallets activas siendo monitoreadas en tiempo real',
    erc8004Label: 'ERC-8004',
    realTimeLabel: 'Tiempo Real',

    // Dashboard - Tooltips
    agentsTooltip: 'agentes',
    noncesTooltip: 'nonces',

    // Dashboard - Categorías Metadata
    metadataExcellent: 'Excelente',
    metadataStrong: 'Fuerte',
    metadataModerate: 'Moderado',
    metadataBasic: 'Básico',
    metadataLimited: 'Limitado',
    metadataIncomplete: 'Incompleto',
    metadataElite: 'Elite',
    metadataGood: 'Bueno',
    metadataRegular: 'Regular',
    metadataLow: 'Baja',
    metadataPoor: 'Mala',
    averageLabel: 'Promedio',

    // Agentes - Opciones de búsqueda
    searchGeneral: 'General',
    searchNetwork: 'Red',
    searchName: 'Nombre',
    searchDescription: 'Descripción',
    searchWallet: 'Billetera de Agente',
    searchWalletOwner: 'Billetera de Propietario',
    searchAgentIdentifier: 'Identificador de Agente',
    searchMetadata: 'Metadatos',
    searchSupportedTrust: 'Confianza Soportada',
    searchSkills: 'Habilidades',
    searchCapabilities: 'Capacidades',
    searchTags: 'Etiquetas',
    searchOasfSkills: 'Habilidades OASF',
    searchOasfDomains: 'Dominios OASF',
    searchTechnicalTools: 'Herramientas Técnicas',
    searchTechnicalPrompts: 'Indicaciones Técnicas',
    searchTechnicalCapabilities: 'Capacidades Técnicas',
    searchServices: 'Servicios',

  // Agentes - Filtros específicos
  selectCategory: 'Seleccionar categoría',
  searchCategories: 'Buscar categorías',
  searchSubcategories: 'Buscar subcategorías',

    // Agentes - Etiquetas de tarjetas
    humiScoreLabel: 'Índice HUMI - Score',
    humiScoreShort: 'HUMI',

    // Agentes - Ordenamiento
    sortByLabel: 'Ordenar por',
    sortLabel: 'Ordenar:',
    sortName: 'Nombre',
    sortCreatedDate: 'Fecha de Creación On-Chain',
    sortHumiScore: 'Score Índice HUMI',
    sortNonce: 'Nonce',
    sortBalance: 'Balance',

    // Agentes - Paginación
    previous: 'Anterior',
    next: 'Siguiente',
    show: 'Mostrar',
    agentsPerPage: 'agentes por página',

    // Agentes - Estados vacíos
    noTags: 'Sin tags',
    noSkills: 'Sin skills',

    // Agentes - Tooltips
    clearFiltersTooltip: 'Limpiar filtros específicos',
    searchLoadingAgents: 'Consultando base de datos...',
    searchUpdatingResults: 'Actualizando resultados...',
    searchLoadErrorGeneric: 'No se pudieron cargar los agentes. Inténtalo de nuevo.',
    searchLoadErrorServer: 'Error del servidor al cargar agentes. Inténtalo más tarde.',
    searchRetry: 'Reintentar',
    hideAdvancedFilter: 'Ocultar filtro avanzado',
    addFilter: 'Agregar filtro',
    clearAllFilters: 'Limpiar todos los filtros',
    resultsLabel: 'resultados',
    activeFiltersLabel: 'filtros activos',
    advancedFilterLabel: 'Filtro avanzado',
    searchCategoryPlaceholder: 'Buscar categoría...',
    selectValuePlaceholder: 'Seleccionar valor...',
    searchSubcategoryPlaceholder: 'Buscar subcategoría...',
    simpleFilterHint: 'Filtro simple: selecciona un valor de la lista.',
    searchChipLabel: 'Búsqueda',
    searchTypeChipLabel: 'Tipo de búsqueda',
    noAgentsFound: 'No se encontraron agentes con los parámetros de búsqueda seleccionados',
    sortAscending: 'Orden ascendente',
    sortDescending: 'Orden descendente',
    notAvailable: 'N/A',
    noDescription: 'Sin descripción',
    agentLabel: 'Agente',
    ownerLabel: 'Owner',
    nonceValueLabel: 'Nonce',
    skillsLabel: 'Skills',
    capabilitiesLabel: 'Capabilities',
    dummyLabel: 'Dummy',
    duplicateLabel: 'Duplicado',
    aiCategoryPrimaryLabel: 'Categoría Principal',
    aiCategorySecondaryLabel: 'Categoría secundaria',
    aiCategoryConfidenceLabel: 'Confianza AI',
    aiCategoryPurposeLabel: 'Análisis',
    aiCategoryAnalyzingLabel: 'Analizando…',
    agentsDirectoryAiCategoryLabel: 'GSA Análisis AI - Categoría',
    agentsDirectoryAiAnalysisLabel: 'GSA Análisis AI - Análisis',

    recentAgentsSubmenu: 'Recientes',
    favoriteAgentsSubmenu: 'Favoritos',
    closeSidebarAgent: 'Cerrar pestaña',
    favoriteAgent: 'Agregar a favoritos',
    unfavoriteAgent: 'Quitar de favoritos',
    agentMenuAria: 'Acciones del agente',

    agentDetailLoadError:
      'No fue posible obtener los datos desde la base de datos.',
    agentDetailLoading: 'Cargando información del agente…',
    agentDetailHumiScoreLabel: 'HUMI Score',
    agentDetailWamiScoreLabel: 'WAMI Score',
    agentDetailIndexHumiTitle: 'Índice HUMI',
    agentDetailIndexWamiTitle: 'Índice WAMI',
    agentDetailIndexInfoAriaLabel: 'Más información sobre este índice',
    agentDetailIndexHumiHelp:
      'El Índice HUMI (Human-like Metrics Index) es una puntuación de reputación de un solo número del 0 al 100 que mide la calidad general, legitimidad, madurez e inteligencia real de cualquier Agente en el ecosistema ERC-8004.',
    agentDetailIndexWamiHelp:
      'El Índice WAMI (Wallet Advanced Metrics Index) es una puntuación de reputación de un solo número del 0 al 100 que mide la calidad general, legitimidad, nivel de riesgo y madurez de cualquier wallet on-chain.',
    agentDetailViewDetails: 'Ver detalles',
    agentDetailIndexPlusAriaLabelHumi: 'Ver índice HUMI',
    agentDetailIndexPlusAriaLabelWami: 'Ver detalle del Índice WAMI',
    agentDetailRealnessTitle: 'Realness del agente',
    agentDetailRealnessHelp:
      'El Realness del agente es una puntuación de 0 a 100 que evalúa si presenta una identidad legítima y profesional (nombre, descripción, perfil externo e imagen). Actúa como filtro de entrada: solo los agentes con estado válido desbloquean análisis avanzados (WAMI, owner, actividad). Los demás siguen teniendo Índice HUMI, pero con menor visibilidad.',
    agentDetailRealnessInfoAriaLabel: 'Más información sobre Realness del agente',
    realnessStatusValid: 'Válido',
    realnessStatusInsufficientInfo: 'Info insuficiente',
    realnessStatusDummy: 'Dummy',
    realnessStatusTest: 'Test',
    realnessBusinessMeaningValid:
      'Agente de alta calidad. Desbloquea todos los análisis de la plataforma y mejora su posicionamiento.',
    realnessBusinessMeaningInsufficientInfo:
      'Básico pero incompleto. Visibilidad limitada y sin análisis profundos.',
    realnessBusinessMeaningDummy:
      'Probablemente un agente de prueba o spam. Se aplican penalizaciones fuertes.',
    realnessBusinessMeaningTest: 'Agente de baja calidad o experimental.',
    realnessStatusInfoAriaLabel: 'Más información sobre este estado de Realness',
    agentHumiBackToOverview: 'Volver a la vista general',
    agentHumiMissingAgentId: 'Selecciona un agente desde el directorio para ver su Índice HUMI.',
    agentHumiGoToDirectory: 'Ir al directorio de agentes',
    agentHumiCalculatedAt: 'Índice calculado el',
    agentHumiIndexScoreTitle: 'Puntuación del índice',
    agentHumiPageTitleSuffix: '(Índice HUMI)',
    agentHumiChartTitle: 'Evolución del índice',
    agentHumiTrendTitle: 'Tendencia',
    agentHumiTrendScopeLabel: 'Tipo de tendencia',
    agentHumiTrendPeriodLabel: 'Período',
    agentHumiTrendScopeIndex: 'Tendencia del índice',
    agentHumiTrendScopePillar: 'Tendencia del pilar',
    agentHumiPillarDetailsTitle: 'Detalles del pilar',
    agentHumiPillarDetailsSelectPillar:
      'Selecciona un pilar en el gráfico de scores para ver su resumen ejecutivo.',
    agentHumiPillarDetailsNoData: 'Sin resumen ejecutivo para este pilar.',
    agentHumiPillarDetailsColInformation: 'Información',
    agentHumiPillarDetailsColDescription: 'Descripción',
    agentHumiPillarDetailsEmpty: 'Sin información disponible.',
    agentHumiPillarDetailsKeyStrengths: 'Fortalezas clave',
    agentHumiPillarDetailsMainConcerns: 'Principales preocupaciones',
    agentHumiPillarDetailsRecommendation: 'Recomendación',
    agentHumiPillarDetailsOverallAssessment: 'Evaluación general',
    agentHumiPillarDetailsBusinessInterpretation: 'Interpretación de negocio',
    agentHumiChart30d: 'Últimos 30 cambios',
    agentHumiChartMonthly: 'Por mes',
    agentHumiChartEmpty: 'Sin datos de evolución para este período.',
    agentHumiPillarsTitle: 'Score por pilar',
    agentHumiPillarHistory: 'Historia (H)',
    agentHumiPillarUsage: 'Uso (U)',
    agentHumiPillarMeasure: 'Medida (M)',
    agentHumiPillarInformation: 'Información (I)',
    agentHumiPillarsEmpty: 'Sin datos de pilares para este agente.',
    agentHumiPillarMax: 'de 25',
    agentHumiPillarTrendTitle: 'Evolución del pilar',
    agentHumiPillarTrendNoDbData:
      'No hay datos históricos en la base de datos para este pilar.',
    agentHumiPillarTrendSelectPillar:
      'Selecciona un pilar en el gráfico de scores para ver su evolución.',
    agentHumiPillarSummaryTitle: 'Desglose por bloques',
    agentHumiPillarBlockBasic: 'Básico',
    agentHumiPillarBlockIntermediate: 'Intermedio',
    agentHumiPillarBlockAdvanced: 'Avanzado',
    agentHumiPillarSummaryNoData: 'No hay datos de desglose para este pilar.',
    agentHumiBlockDetailsTitle: 'Detalles del bloque',
    agentHumiBlockDetailsSelectPillar:
      'Selecciona un pilar en el gráfico de scores para ver el detalle por bloque.',
    agentHumiBlockDetailsSelectBlock:
      'Selecciona un bloque en el desglose por bloques para ver sus ítems.',
    agentHumiBlockDetailsNoItems: 'No hay ítems de detalle para este bloque.',
    agentHumiBlockDetailsColItem: 'Ítem',
    agentHumiBlockDetailsColBusiness: 'Descripción de negocio',
    agentHumiBlockDetailsColReason: 'Razón del score',
    agentHumiBlockDetailsColItemDetails: 'Detalles del ítem',
    agentHumiBlockDetailsColScore: 'Score',
    agentHumiBlockDetailsGenericDescription: 'Sin descripción específica disponible.',
    agentHumiBlockDetailsReasonEmpty: 'Sin detalle de razón disponible.',
    agentHumiBlockDetailsItemDetailsEmpty: 'Sin detalles adicionales.',
    agentHumiBlockDetailsTotalLabel: 'Total del bloque',
    agentWamiBackToOverview: 'Volver a la vista general',
    agentWamiMissingAgentId: 'Selecciona un agente desde el directorio para ver su Índice WAMI.',
    agentWamiGoToDirectory: 'Ir al directorio de agentes',
    agentWamiCalculatedAt: 'Índice calculado el',
    agentWamiPageTitleSuffix: '(Índice WAMI)',
    agentWamiAgentSummaryTitle: 'Resumen de agente',
    agentWamiWalletAnalysisTitle: 'Wallets',
    agentWamiWalletMaturityLabel: 'Madurez',
    agentWamiWalletPillarsTitle: 'Pilares de la wallet',
    agentWamiWalletCarouselLabel: 'Wallet',
    agentWamiWalletCarouselPrev: 'Wallet anterior',
    agentWamiWalletCarouselNext: 'Siguiente wallet',
    agentWamiWalletCarouselEmpty: 'Sin wallets disponibles para este agente.',
    agentWamiWalletCarouselCopy: 'Copiar dirección',
    agentWamiWalletCarouselCopied: 'Dirección copiada.',
    agentWamiTrendTitle: 'Tendencia',
    agentWamiTrendScopeLabel: 'Tipo de tendencia',
    agentWamiTrendPeriodLabel: 'Período',
    agentWamiTrendScopeIndex: 'Tendencia del índice',
    agentWamiTrendScopePillar: 'Tendencia del pilar',
    agentWamiPillarDetailsTitle: 'Detalles del pilar',
    agentWamiPillarDetailsSelectPillar:
      'Selecciona un pilar en el gráfico de pilares de la wallet para ver su resumen ejecutivo.',
    agentWamiPillarDetailsNoData: 'Sin resumen ejecutivo para este pilar y wallet.',
    agentWamiPillarDetailsColInformation: 'Información',
    agentWamiPillarDetailsColDescription: 'Descripción',
    agentWamiPillarDetailsEmpty: 'Sin información disponible.',
    agentWamiPillarDetailsKeyStrengths: 'Fortalezas clave',
    agentWamiPillarDetailsMainConcerns: 'Principales preocupaciones',
    agentWamiPillarDetailsRecommendation: 'Recomendación',
    agentWamiPillarDetailsOverallAssessment: 'Evaluación general',
    agentWamiPillarDetailsBusinessInterpretation: 'Interpretación de negocio',
    agentWamiChart30d: 'Últimos 30 cambios',
    agentWamiChartMonthly: 'Por mes',
    agentWamiChartEmpty: 'Sin datos de evolución para este período.',
    agentWamiPillarOrigins: 'Orígenes (O)',
    agentWamiPillarPortfolio: 'Portafolio (P)',
    agentWamiPillarActivity: 'Actividad (A)',
    agentWamiPillarMultichain: 'Multi-cadena (M)',
    agentWamiPillarsEmpty: 'Sin datos de pilares para esta wallet.',
    agentWamiPillarMax: 'de 25',
    agentWamiPillarTrendNoDbData:
      'No hay datos históricos en la base de datos para este pilar.',
    agentWamiPillarTrendSelectPillar:
      'Selecciona un pilar en el gráfico de pilares de la wallet para ver su evolución.',
    agentWamiPillarSummaryTitle: 'Desglose por bloques',
    agentWamiPillarBlockBasic: 'Básico',
    agentWamiPillarBlockIntermediate: 'Intermedio',
    agentWamiPillarBlockAdvanced: 'Avanzado',
    agentWamiPillarSummaryNoData: 'No hay datos de desglose para este pilar y wallet.',
    agentWamiBlockDetailsTitle: 'Detalles del bloque',
    agentWamiBlockDetailsSelectPillar:
      'Selecciona un pilar en el gráfico de pilares de la wallet para ver el detalle por bloque.',
    agentWamiBlockDetailsSelectBlock:
      'Selecciona un bloque en el desglose por bloques para ver sus ítems.',
    agentWamiBlockDetailsNoItems: 'No hay ítems de detalle para este bloque.',
    agentWamiBlockDetailsColItem: 'Ítem',
    agentWamiBlockDetailsColBusiness: 'Descripción de negocio',
    agentWamiBlockDetailsColReason: 'Razón del score',
    agentWamiBlockDetailsColItemDetails: 'Detalles del ítem',
    agentWamiBlockDetailsColScore: 'Score',
    agentWamiBlockDetailsGenericDescription: 'Sin descripción específica disponible.',
    agentWamiBlockDetailsReasonEmpty: 'Sin detalle de razón disponible.',
    agentWamiBlockDetailsItemDetailsEmpty: 'Sin detalles adicionales.',
    agentWamiBlockDetailsTotalLabel: 'Total del bloque',
    agentDetailWeb: 'Web',
    agentDetailEmail: 'Email',
    readMoreDescription: 'Leer más',
    descriptionModalTitle: 'Descripción completa',
    closeModal: 'Cerrar',
    agentDetailOnChainData: 'On Chain',
    agentDetailChainLabel: 'Red',
    agentDetailWalletOnChainIdInfo: 'On Chain ID (wallet registro)',
    agentDetailCreatedAt: 'Creado en',
    agentDetailOwnerChanges: 'Cambios de propietario',
    agentDetailOwnerWallet: 'Wallet del propietario',
    agentDetailOwnerSince: 'Propietario desde',
    agentDetailOwnerCardTitle: 'Propietario',
    agentDetailOwnerActivityTitle: 'Actividad por red',
    agentDetailOwnerFirstActivity: 'Primera actividad',
    agentDetailOwnerWalletTypeActive: 'Active',
    agentDetailOwnerWalletTypeHolder: 'Holder',
    agentDetailOwnerWalletTypeActiveHelp:
      'La wallet presenta actividad transaccional en la red.',
    agentDetailOwnerWalletTypeHolderHelp:
      'La wallet no presenta actividad transaccional en la red.',
    agentDetailOwnerWalletTypeInfoAriaLabel: 'Más información sobre el tipo de wallet',
    agentDetailOwnerActivityEmpty: 'Sin actividad registrada por red',
    agentDetailOwnerActivityPrev: 'Red anterior',
    agentDetailOwnerActivityNext: 'Siguiente red',
    agentDetailMetadataInformation: 'Metadatos',
    agentDetailTransactionalData: 'Transaccional',
    agentDetailTransactionalWalletTitle: 'Wallet transaccional',
    agentDetailWalletDetailsTitle: 'Detalles de wallet',
    agentDetailTransactionalWalletPrev: 'Wallet anterior',
    agentDetailTransactionalWalletNext: 'Siguiente wallet',
    agentDetailTransactionalWalletEmpty: 'Sin wallets transaccionales disponibles.',
    agentDetailTransactionalWalletWamiLabel: 'Score WAMI',
    agentDetailTransactionalWalletCategoryLabel: 'Categoría',
    agentDetailWalletCategoryInfoAriaLabel: 'Más información sobre la categoría',
    agentDetailWalletCategoryExplanationFallback:
      'Sin explicación de negocio para esta categoría.',
    agentDetailFeedbackData: 'Feedback',
    transactionalTabNonce: 'Nonce',
    transactionalTabBalance: 'Balance',
    transactionalNonceCurrentLabel: 'Nonce actual',
    transactionalBalanceCurrentLabel: 'Balance actual',
    transactionalNonceCurrentHelp:
      'Nonce de la wallet seleccionada (todas las chains) o de la chain filtrada.',
    transactionalBalanceCurrentHelp:
      'Balance nativo de la chain filtrada. Con «Todas» no se suma entre chains (tokens distintos).',
    transactionalNonceInfoAriaLabel: 'Más información sobre el nonce actual',
    transactionalBalanceInfoAriaLabel: 'Más información sobre el balance actual',
    transactionalChainFilterAll: 'Todas',
    transactionalBalanceMultiChainLabel: 'Multi-chain',
    transactionalBalanceMultiChainHelp:
      'El balance no se agrega entre chains porque cada una usa su token nativo. Elige una chain o mira el gráfico multi-línea.',
    metadataTabSkills: 'Skills',
    metadataTabSupportedTrust: 'Confianza',
    metadataTabCapabilities: 'Capacidades',
    metadataTabTags: 'Tags',
    metadataTabOasfSkills: 'OASF skills',
    metadataTabOasfDomains: 'OASF dominios',
    metadataTabTechnicalTools: 'Herramientas',
    metadataTabTechnicalPrompts: 'Prompts',
    metadataTabTechnicalCapabilities: 'Cap. técnicas',
    metadataTabServices: 'Servicios',
    metadataX402Enabled: 'x402 activado',
    metadataX402Disabled: 'x402 desactivado',
    agentDetailMetadataViewAnalysis: 'Análisis',
    agentDetailMetadataViewData: 'Datos',
    agentDetailMetadataRichnessScoreLabel: 'Score de riqueza de metadata',
    agentDetailRichnessScoreLabel: 'Richness Score',
    agentDetailRichnessScoreHelp:
      'El Metadata Richness Score es una métrica de calidad de 0 a 100 que evalúa qué tan completo, profesional y sofisticado es el perfil público del agente.',
    agentDetailRichnessScoreInfoAriaLabel: 'Más información sobre el richness score',
    agentDetailMetadataRichnessTotalLabel: 'Total',
    agentDetailMetadataRichnessCalculatedAt: 'Última actualización de metadata',
    agentDetailMetadataLayerRangeBasic: '0–40',
    agentDetailMetadataLayerRangeIntermediate: '40–70',
    agentDetailMetadataLayerRangeAdvanced: '70–100',
    agentDetailMetadataLayerBasic: 'Capa básica',
    agentDetailMetadataLayerIntermediate: 'Capa intermedia',
    agentDetailMetadataLayerAdvanced: 'Capa avanzada',
    agentDetailMetadataRichnessEmpty: 'No hay datos de análisis de metadata disponibles.',
    agentDetailMetadataRichnessHoverPlaceholder:
      'Pasa el cursor por un segmento de las barras para ver el detalle y la puntuación del ítem.',
    agentDetailMetadataLayerNoBreakdown: 'Sin desglose por ítems',
    agentDetailMetadataLayerPrev: 'Capa anterior',
    agentDetailMetadataLayerNext: 'Siguiente capa',
    agentDetailMetadataLayerRemaining: 'Restante',
    agentDetailMetadataLayerRemainingHelp:
      'Puntos que aún se pueden alcanzar en esta capa (diferencia entre el máximo de la capa y la puntuación obtenida).',
    agentDetailMetadataItemExplanationFallback:
      'No hay una explicación de negocio disponible para este ítem.',
    agentDetailMetadataItemInfoAriaLabel: 'Más información sobre este ítem de metadata',
    feedbackAxisCommentQuality: 'Calidad de comentarios',
    feedbackAxisAttestationQuality: 'Calidad de attestation',
    feedbackAxisFeedbackVolume: 'Volumen de feedback',
    feedbackAxisProtocolActivity: 'Actividad de protocolo',
    feedbackAxisExecutionSuccess: 'Éxito de ejecución',
    feedbackAxisAttestationValidity: 'Validez de attestation',
    feedbackAxisPaidProtocolActivity: 'Actividad de protocolo pagada',
    feedbackAxisFreshness: 'Actualidad',
    agentDetailFeedbackAnalysisEmpty: 'No hay análisis de feedback disponible.',
    agentDetailFeedbackRadarScale: 'Escala: 0–{max}',
    agentDetailFeedbackRadarStrengthTitle: 'Fortaleza de feedback: {avg} (promedio de {n} ejes)',
    feedbackTabComments: 'Comentarios',
    feedbackTabAttestations: 'Attestations',
    feedbackTabExternalAudit: 'Auditoría externa',
    feedbackTabIdentityAnalysis: 'Identidad',
    feedbackTabOnChainExecutions: 'Ejecuciones on-chain',
    feedbackTabOnChainFeedbacks: 'Feedback on-chain',
    feedbackTabProtocolActivity: 'Actividad de protocolo',
    agentDetailCommentsPieValid: 'Válidos',
    agentDetailCommentsPieRevoked: 'Revocados',
    agentDetailCommentsPieOther: 'Otros',
    agentDetailCommentsTotal: 'Total comentarios',
    agentDetailCommentsRatio: 'Ratio comentarios',
    agentDetailCommentsLastRecord: 'Último comentario',
    agentDetailAttestationsPieValid: 'Válidas',
    agentDetailAttestationsPieSpam: 'Spam',
    agentDetailAttestationsPieRevoked: 'Revocadas',
    agentDetailAttestationsPieOther: 'Otros',
    agentDetailAttestationsTotal: 'Total attestations',
    agentDetailAttestationsRate: 'Rate attestations',
    agentDetailAttestationsScoreAvg: 'Score promedio',
    agentDetailAttestationsLastRecord: 'Última attestation',
    agentDetailExternalAuditSourcesTitle: 'Fuentes externas',
    agentDetailExternalAuditEntityLabel: 'Entidad',
    agentDetailExternalAuditScoreLabel: 'Score',
    agentDetailExternalAuditLastAtLabel: 'Última actualización',
    agentDetailExternalAuditPrev: 'Fuente anterior',
    agentDetailExternalAuditNext: 'Fuente siguiente',
    agentDetailExternalAuditEmpty: 'No hay fuentes externas para mostrar.',
    agentDetailExternalAuditSourceCount: 'Total fuentes',
    agentDetailExternalAuditGlobalScore: 'Score global',
    agentDetailExternalAuditLastRecord: 'Última auditoría',
    agentDetailIdentityScore: 'Score de identidad',
    agentDetailIdentityStage: 'Etapa de identidad',
    agentDetailIdentityLastRecord: 'Último registro de identidad',
    agentDetailOnChainExecutionCategoriesTitle: 'Categorías de ejecución',
    agentDetailOnChainExecutionCategoryLabel: 'Categoría',
    agentDetailOnChainExecutionCountLabel: 'Conteo',
    agentDetailOnChainExecutionLastAtLabel: 'Última ejecución',
    agentDetailOnChainExecutionPrev: 'Categoría anterior',
    agentDetailOnChainExecutionNext: 'Categoría siguiente',
    agentDetailOnChainExecutionEmpty: 'No hay categorías de ejecución para mostrar.',
    agentDetailOnChainExecutionTotal: 'Total ejecuciones',
    agentDetailOnChainExecutionRate: 'Rate ejecuciones',
    agentDetailOnChainExecutionLastRecord: 'Última ejecución registrada',
    agentDetailOnChainFeedbackItemsTitle: 'Feedback por categoría',
    agentDetailOnChainFeedbackCategoryLabel: 'Categoría',
    agentDetailOnChainFeedbackSubcategoryLabel: 'Subcategoría',
    agentDetailOnChainFeedbackAvgScoreLabel: 'Score promedio',
    agentDetailOnChainFeedbackPrev: 'Ítem anterior',
    agentDetailOnChainFeedbackNext: 'Ítem siguiente',
    agentDetailOnChainFeedbackEmpty: 'No hay ítems de feedback para mostrar.',
    agentDetailOnChainFeedbackTotal: 'Total feedbacks',
    agentDetailOnChainFeedbackRate: 'Rate feedbacks',
    agentDetailOnChainFeedbackLastRecord: 'Último feedback registrado',
    agentDetailProtocolActivityItemsTitle: 'Actividades de protocolo',
    agentDetailProtocolActivityEntityLabel: 'Entidad',
    agentDetailProtocolActivityActivityLabel: 'Actividad',
    agentDetailProtocolActivityCountLabel: 'Conteo',
    agentDetailProtocolActivityAvgScoreLabel: 'Score promedio',
    agentDetailProtocolActivityRevokeCountLabel: 'Revocados',
    agentDetailProtocolActivityPaymentCountLabel: 'Pagos',
    agentDetailProtocolActivitySlideValidRateLabel: 'Rate válido',
    agentDetailProtocolActivitySlidePaymentRateLabel: 'Rate pago',
    agentDetailProtocolActivityLastAtLabel: 'Última actividad',
    agentDetailProtocolActivityPrev: 'Actividad anterior',
    agentDetailProtocolActivityNext: 'Actividad siguiente',
    agentDetailProtocolActivityEmpty: 'No hay actividades de protocolo para mostrar.',
    agentDetailProtocolActivityTotal: 'Total actividades',
    agentDetailProtocolActivityGlobalScore: 'Score global',
    agentDetailProtocolActivityGlobalValidRate: 'Rate válido global',
    agentDetailProtocolActivityGlobalPaymentRate: 'Rate pago global',
    agentDetailProtocolActivityLastRecord: 'Última actividad registrada',
    agentDetailCopied: 'Copiado al portapapeles',
    agentDetailNoJsonToShow: 'No hay datos para mostrar.',
    chartLabelToday: 'Hoy',
    chartLabel7d: '7 d',
    chartLabel15d: '15 d',
    chartLabel1m: '1 m',
    chartLabel2m: '2 m',
    chartLabel3m: '3 m',
    chartLabel6m: '6 m',
    chartLabel9m: '9 m',
    chartLabel12m: '12 m',
    agentDetailProfilesCardTitle: 'Perfiles',
    agentDetailWarningsTitle: 'Advertencias',
    agentDetailAiAnalysisTitle: 'GSA-AI Analysis',
    agentDetailWarningsEmpty: 'Sin advertencias detectadas',
    agentDetailWarningInfoAriaLabel: 'Más información sobre esta advertencia',
    agentDetailWarningDuplicationMetadataHelp:
      'Cuando un agente tiene nombre, descripción o URI casi idénticos a otros. Impacto: parece copy-paste o spam. Penalización fuerte (-2.0).',
    agentDetailWarningMultiAgentWalletHelp:
      'Una wallet controla varios agentes a la vez. Impacto: sospecha de ataques Sybil o comportamiento coordinado. Penalización -1.5.',
    agentDetailWarningDummyMetadataHelp:
      'Agentes con información muy básica, de prueba o insuficiente. Impacto: difícil confiar o entender qué hace realmente el agente.',
    agentDetailWarningAttestationsSpamHelp:
      'El agente ha recibido comentarios on-chain spam o feedback falso. Impacto: reputación inflada o manipulada. Penalización -2.0.',
    agentDetailWarningExternalAuditWarningHelp:
      'Auditorías externas que marcaron al agente como sospechoso (sybil u otras banderas rojas). Impacto: terceros ya expresaron preocupaciones.',
    agentDetailWarningHighRevocationsHelp:
      'Demasiados feedbacks, comentarios o attestations revocados. Impacto: muestra inconsistencia o disputas. Penalización -1.5.',
    agentDetailWarningOwnerInactiveAgentsHelp:
      'La wallet del agente tiene muchos otros agentes inactivos. Impacto: sugiere que el owner crea y abandona proyectos con frecuencia.',
    agentDetailWarningHighOwnershipChurnHelp:
      'El agente cambió de owner varias veces y el actual lleva menos de 30 días. Impacto: falta de compromiso o estabilidad a largo plazo.',
    agentDetailWarningTransactionalWalletSameAsOwnerHelp:
      'La misma wallet se usa como owner y para actividad transaccional intensa. Impacto: alto riesgo de autopromoción o manipulación.',
    agentDetailWarningLowerRealnessHelp:
      'El agente no alcanza el umbral mínimo de calidad en identidad y metadata. Impacto: difícil verificar si es un agente real y legítimo.',
    agentDetailWarningLowerMetadataRichnessHelp:
      'El agente tiene muy poca información útil (sin servicios, skills, enlaces externos, etc.). Impacto: difícil entender sus capacidades reales.',
    governanceTypeLabel: 'Tipo de gobernanza:',
    transactionalDeltaVsPrevious: 'vs anterior',

    dashboardChainsEmpty: 'No hay datos de chains disponibles.',
    dashboardDataLoading: 'Cargando datos del dashboard…',
    dashboardDataLoadError:
      'No hay conexión con la base de datos. Comprueba tu sesión o inténtalo más tarde.',
    dashboardDataRetry: 'Reintentar',
    chainSectionLast30Days: 'Últimos 30 días',
    chainSectionOwners: 'Owners',
    chainSectionAgentInformation: 'Información de agentes',
    chainSectionTechnicalMaturity: 'Madurez técnica',
    chainPctX402: '% x402',
    chainPctMcpA2a: '% MCP / A2A',
    chainSectionWarnings: 'Advertencias',
    chainPctSpam: '% spam',
    chainPctDuplicates: '% duplicados',
    chainOnChainExecutions30d: 'Ejecuciones (30 d)',
    chainOnChainPayments30d: 'Con pagos (30 d)',
    chainOnChainProtocolActivity30d: 'Actividad protocolo (30 d)',
    chainStatPctActive: '% activos',
    chainStatNewAgents30d: 'Nuevos agentes (30 d)',
    chainStatPctWalletActivity: '% con actividad en wallet',
    chainStatPctOnchainActivity: '% con actividad on-chain',
    chainOwnerTotal: 'Total owners',
    chainAvgAgentsPerOwner: 'Media agentes / owner',
    chainChartMonthlyTitle: 'Agentes por mes',
    chainChartHumiDistributionTitle: 'Distribución HUMI',
    chainChartMetadataDistributionTitle: 'Distribución metadata',
    chainDistributionRailHumi: 'HUMI',
    chainDistributionRailMetadata: 'Meta',
    chainDistributionRailWami: 'WAMI',
    chainSectionDistribution: 'Distribución',
    chainDistributionPrev: 'Anterior distribución',
    chainDistributionNext: 'Siguiente distribución',
    chainTop10HumiTitle: 'Top 10 agentes (HUMI)',
    chainTop10HumiEmpty: 'No hay datos de ranking HUMI disponibles.',
    chainWarningDummyMetadata: 'Metadata dummy',
    chainWarningLowerRealness: 'Baja autenticidad',
    chainWarningLowerMetadataRichness: 'Baja riqueza de metadata',
    chainWarningDuplicationMetadata: 'Metadata duplicada',
    chainWarningMultiAgentWallet: 'Wallet multi-agente',
    chainWarningTransactionalWalletSameAsOwner: 'Wallet transaccional = owner',
    chainWarningOwnerInactiveAgents: 'Agentes inactivos del owner',
    chainWarningHighOwnershipChurn: 'Alta rotación de ownership',
    chainWarningAttestationsSpam: 'Spam en attestations',
    chainWarningHighRevocations: 'Revocaciones altas',
    chainWarningExternalAuditWarning: 'Alerta auditoría externa',
    chainWarningDummyMetadataHelp:
      'Porcentaje de agentes con metadata genérica o placeholder detectada en la cadena.',
    chainWarningLowerRealnessHelp:
      'Agentes con señales bajas de autenticidad o consistencia de identidad verificable.',
    chainWarningLowerMetadataRichnessHelp:
      'Agentes con metadata incompleta o poco detallada respecto al estándar esperado.',
    chainWarningDuplicationMetadataHelp:
      'Agentes que comparten metadata duplicada o muy similar con otros agentes.',
    chainWarningMultiAgentWalletHelp:
      'Agentes cuya wallet transaccional coincide con wallets usadas por múltiples agentes.',
    chainWarningTransactionalWalletSameAsOwnerHelp:
      'Agentes cuya wallet de transacciones es la misma que la del owner registrado.',
    chainWarningOwnerInactiveAgentsHelp:
      'Agentes cuyo owner tiene otros agentes inactivos o sin actividad reciente.',
    chainWarningHighOwnershipChurnHelp:
      'Agentes afectados por alta rotación o cambios frecuentes de ownership.',
    chainWarningAttestationsSpamHelp:
      'Agentes con patrones de attestations repetitivas o de baja calidad (spam).',
    chainWarningHighRevocationsHelp:
      'Agentes con un ratio elevado de revocaciones en certificaciones o attestations.',
    chainWarningExternalAuditWarningHelp:
      'Agentes marcados con alertas derivadas de auditorías o revisiones externas.',
    chainWarningInfoAriaLabel: 'Más información sobre esta métrica',
    chainDataUpdatedLabel: 'Última actualización de datos',
    chainSeriesNewAgents: 'Nuevos',
    chainSeriesTotalAgents: 'Total agentes',
    chainSeriesActiveAgents: 'Activos',
  },
  en: {
    home: 'Home',
    blockchains: 'Blockchains',
    agentsDirectory: 'Agents Directory',
    walcert: 'Agent Walcert',
    humiIndex: 'HUMI Index',
    certifications: 'Certifications',
    roadMap: 'Road Map',
    roadMapLine1: 'Upcoming',
    roadMapLine2: 'features',
    roadMapExpandAria: 'Expand upcoming features',
    roadMapCollapseAria: 'Collapse upcoming features',
    cerex: 'CEREX',
    cerow: 'CEROW',
    logout: 'Log Out',

    dashboardTitle: 'Dashboard',
    platformTitle: 'GSA Platform',
    searchPlaceholder: 'Search agents...',
    searchAction: 'Search',
    profile: 'Profile',
    subscriptions: 'Subscriptions',
    api: 'API',
    signOut: 'Sign Out',
    subscriptionsPageTitle: 'Subscriptions',
    apiPageTitle: 'API',
    apiCreditsTitle: 'API credits',
    apiCreditsLoading: 'Loading credits...',
    apiCreditsEmpty: 'You have no API credits on record.',
    apiCreditsType: 'Type',
    apiCreditsAmount: 'Available credits',
    apiCreditsValidFrom: 'Valid from',
    apiCreditsValidTo: 'Valid until',
    newsTickerEmpty: 'No active news at the moment.',
    feedbacks: 'Feedbacks',
    feedbacksPageTitle: 'Feedbacks',
    feedbacksHistoryTitle: 'My feedback',
    feedbacksNewTitle: 'New feedback',
    feedbacksEmpty: 'You have not submitted any feedback yet.',
    feedbacksType: 'Type',
    feedbacksMessage: 'Message',
    feedbacksDate: 'Date',
    feedbacksGsaReply: 'GSA reply',
    feedbacksTypePlaceholder: 'Select a type',
    feedbacksMessagePlaceholder: 'Write your feedback...',
    feedbacksSave: 'Submit feedback',
    feedbacksSaving: 'Submitting...',
    feedbacksSaved: 'Feedback submitted successfully.',
    feedbacksLoading: 'Loading feedback...',
    feedbacksInvalidForm: 'Select a type and enter a message.',
    subscriptionsActiveTitle: 'Active subscription',
    subscriptionsHistoryTitle: 'Subscription history',
    subscriptionsPlanColumn: 'Plan',
    subscriptionsStatusColumn: 'Status',
    subscriptionsPeriodStartColumn: 'Period start',
    subscriptionsPeriodEndColumn: 'Period end',
    subscriptionsCreatedColumn: 'Created',
    subscriptionsActiveBadge: 'Active',
    subscriptionsNoActive: 'You do not have an active subscription.',
    subscriptionInactiveBadge: 'The profile does not have an active subscription',
    subscriptionInactiveVideoLabel: 'Inactive subscription animation',
    subscriptionsNoHistory: 'No subscriptions in history.',
    subscriptionsPlansBilling: 'Plans & billing',
    subscriptionsLoading: 'Loading subscriptions...',
    subscriptionsAvailablePlansTitle: 'Available plans',
    subscriptionsSoonBadge: 'Coming soon',
    subscriptionsSubscribe: 'Subscribe',
    subscriptionsSubscribeLoading: 'Processing…',
    subscriptionsCheckoutError: 'Could not start checkout. Please try again.',
    subscriptionsCheckoutEmailSent:
      'Subscription started. Check your email to complete payment on NOWPayments.',
    subscriptionsCheckoutMissingSubscription:
      'There is no active subscription to start checkout.',
    subscriptionsCurrentPlan: 'Your current plan',
    subscriptionsMoreDetailsTitle: 'More details',
    subscriptionsMonthlyLabel: 'Monthly',
    subscriptionsAnnualLabel: 'Annual',
    subscriptionsSavingsLabel: 'Savings',
    subscriptionsIncludesLabel: "What's included",
    subscriptionsDaysValidLabel: 'Days valid',
    subscriptionsApiCreditsLabel: 'Monthly API credits',
    subscriptionsPriceLabel: 'Price',
    subscriptionsDiscountLabel: 'Discount',
    subscriptionsNoPlansAvailable: 'No plans are available at this time.',
    subscriptionTagLabel: 'Subscription',
    subscriptionPeriodStart: 'Start',
    subscriptionPeriodEnd: 'End',

    welcomeTitle: 'Welcome!',
    welcomeSubtitle: 'General Overview ERC-8004 Ecosystem',
    registeredAgents: 'Registered Agents',
    activeAgents: 'Active Agents',
    agentsWithFeedback: 'Agents with Feedback',
    monitoredWallets: 'Monitored Wallets',
    dashboardKpiOwnerTotal: 'Total owners',
    dashboardKpiAgentNew: 'New agents',
    dashboardKpiFeedbackNew: 'New feedbacks',
    dashboardKpiAgentsWithFeedback: 'Agents with feedback',
    dashboardKpiFeedbackTotal: 'Total feedbacks',
    humiDistributionTitle: 'HUMI Index Distribution',
    distributionDonutTotalLabel: 'Total',
    distributionDonutSegmentsLabel: 'segments',
    cerowTitle: 'Owner Certificate',
    cerexTitle: 'Existence Certificate',
    comingSoon: 'Coming Soon',
    dashboardOverviewTitle: 'Overview ERC-8004 Ecosystem',
    agentOverviewTitle: 'General Overview',
    humiElite: 'Elite',
    humiVeryStable: 'Very Stable',
    humiStable: 'Stable',
    humiDeveloping: 'Developing',
    humiUnstable: 'Unstable',
    humiNotCalculate: 'Not calculated',
    humiHighPerformance: 'High Performance',
    humiModerateRisk: 'Moderate Risk',
    humiCritical: 'Critical',

    // Dashboard - Cards y elementos
    humiIndexTitle: 'Index',
    metadataRichnessTitle: 'Metadata Richness',
    wamiDistributionTitle: 'WAMI Index Distribution',
    dashboardOverviewDistributionTitle: 'Global distribution',
    dashboardOverviewTop10Badge: 'Top 10 ecosystem',
    monitoredChainsTitle: 'Monitored chains',
    agentNonceTitle: 'Agent Nonce',
    dashboardInsightNonceBadge: 'Agent Nonce - Last 30 Days',
    dashboardInsightEcosystemBadge: 'Daily Nonce (Last 30 Days)',
    last30DaysTitle: 'Last 30 Days',
    totalLabel: 'Total',
    nonceLabel: 'nonce',
    agentsLabel: 'Agents',
    ownersLabel: 'Owners',
    activeLabel: 'Active',
    feedbacksLabel: 'Feedbacks',

    // Dashboard - Descripciones
    totalAgentsDescription: 'Total registered agents in ERC-8004',
    activeAgentsDescription: 'Agents with recent activity',
    agentsWithFeedbackDescription: 'Agents with feedback',
    monitoredWalletsDescription: 'Active wallets being monitored in real time',
    erc8004Label: 'ERC-8004',
    realTimeLabel: 'Real Time',

    // Dashboard - Tooltips
    agentsTooltip: 'agents',
    noncesTooltip: 'nonces',

    // Dashboard - Categorías Metadata
    metadataExcellent: 'Excellent',
    metadataStrong: 'Strong',
    metadataModerate: 'Moderate',
    metadataBasic: 'Basic',
    metadataLimited: 'Limited',
    metadataIncomplete: 'Incomplete',
    metadataElite: 'Elite',
    metadataGood: 'Good',
    metadataRegular: 'Regular',
    metadataLow: 'Low',
    metadataPoor: 'Poor',
    averageLabel: 'Average',

    // Agentes - Opciones de búsqueda
    searchGeneral: 'General',
    searchNetwork: 'Network',
    searchName: 'Name',
    searchDescription: 'Description',
    searchWallet: 'Wallet',
    searchWalletOwner: 'Wallet Owner',
    searchAgentIdentifier: 'Agent Identifier',
    searchMetadata: 'Metadata',
    searchSupportedTrust: 'Supported Trust',
    searchSkills: 'Skills',
    searchCapabilities: 'Capabilities',
    searchTags: 'Tags',
    searchOasfSkills: 'OASF Skills',
    searchOasfDomains: 'OASF Domains',
    searchTechnicalTools: 'Technical Tools',
    searchTechnicalPrompts: 'Technical Prompts',
    searchTechnicalCapabilities: 'Technical Capabilities',
    searchServices: 'Services',

  // Agentes - Filtros específicos
  selectCategory: 'Select category',
  searchCategories: 'Search categories',
  searchSubcategories: 'Search subcategories',

    // Agentes - Etiquetas de tarjetas
    humiScoreLabel: 'HUMI Index - Score',
    humiScoreShort: 'HUMI',

    // Agentes - Ordenamiento
    sortByLabel: 'Sort by',
    sortLabel: 'Sort:',
    sortName: 'Name',
    sortCreatedDate: 'On-Chain Creation Date',
    sortHumiScore: 'HUMI Index Score',
    sortNonce: 'Nonce',
    sortBalance: 'Balance',

    // Agentes - Paginación
    previous: 'Previous',
    next: 'Next',
    show: 'Show',
    agentsPerPage: 'agents per page',

    // Agentes - Estados vacíos
    noTags: 'No tags',
    noSkills: 'No skills',

    // Agentes - Tooltips
    clearFiltersTooltip: 'Clear specific filters',
    searchLoadingAgents: 'Querying database...',
    searchUpdatingResults: 'Updating results...',
    searchLoadErrorGeneric: 'Could not load agents. Please try again.',
    searchLoadErrorServer: 'Server error while loading agents. Please try again later.',
    searchRetry: 'Retry',
    hideAdvancedFilter: 'Hide advanced filter',
    addFilter: 'Add filter',
    clearAllFilters: 'Clear all filters',
    resultsLabel: 'results',
    activeFiltersLabel: 'active filters',
    advancedFilterLabel: 'Advanced filter',
    searchCategoryPlaceholder: 'Search category...',
    selectValuePlaceholder: 'Select value...',
    searchSubcategoryPlaceholder: 'Search subcategory...',
    simpleFilterHint: 'Simple filter: select a value from the list.',
    searchChipLabel: 'Search',
    searchTypeChipLabel: 'Search type',
    noAgentsFound: 'No agents were found with the selected search parameters',
    sortAscending: 'Ascending order',
    sortDescending: 'Descending order',
    notAvailable: 'N/A',
    noDescription: 'No description',
    agentLabel: 'Agent',
    ownerLabel: 'Owner',
    nonceValueLabel: 'Nonce',
    skillsLabel: 'Skills',
    capabilitiesLabel: 'Capabilities',
    dummyLabel: 'Dummy',
    duplicateLabel: 'Duplicated',
    aiCategoryPrimaryLabel: 'Main Category',
    aiCategorySecondaryLabel: 'Secondary category',
    aiCategoryConfidenceLabel: 'AI confidence',
    aiCategoryPurposeLabel: 'Analysis',
    aiCategoryAnalyzingLabel: 'Analyzing…',
    agentsDirectoryAiCategoryLabel: 'GSA AI Analysis - Category',
    agentsDirectoryAiAnalysisLabel: 'GSA AI Analysis - Analysis',

    recentAgentsSubmenu: 'Recent',
    favoriteAgentsSubmenu: 'Favorites',
    closeSidebarAgent: 'Close tab',
    favoriteAgent: 'Add to favorites',
    unfavoriteAgent: 'Remove from favorites',
    agentMenuAria: 'Agent actions',

    agentDetailLoadError:
      'Could not load data from the database.',
    agentDetailLoading: 'Loading agent details…',
    agentDetailHumiScoreLabel: 'HUMI Score',
    agentDetailWamiScoreLabel: 'WAMI Score',
    agentDetailIndexHumiTitle: 'Index HUMI',
    agentDetailIndexWamiTitle: 'Index WAMI',
    agentDetailIndexInfoAriaLabel: 'More information about this index',
    agentDetailIndexHumiHelp:
      'The Index HUMI (Human-like Metrics Index) is a powerful, single-number reputation score ranging from 0 to 100 that measures the overall quality, legitimacy, maturity, and real-world intelligence of any Agent in the ERC-8004 ecosystem.',
    agentDetailIndexWamiHelp:
      'The Index WAMI (Wallet Advanced Metrics Index) is a powerful, single-number reputation score ranging from 0 to 100 that measures the overall quality, legitimacy, risk level, and maturity of any on-chain wallet.',
    agentDetailViewDetails: 'View details',
    agentDetailIndexPlusAriaLabelHumi: 'View HUMI index',
    agentDetailIndexPlusAriaLabelWami: 'View WAMI index details',
    agentDetailRealnessTitle: 'Agent Realness',
    agentDetailRealnessHelp:
      'Agent Realness is a 0–100 score that evaluates whether an agent presents a legitimate, professional identity (name, description, external profile, and image). It acts as an entry gate: only agents with valid status unlock advanced analysis (WAMI, owner, activity). Others still receive an Index HUMI score, but with lower visibility.',
    agentDetailRealnessInfoAriaLabel: 'More information about Agent Realness',
    realnessStatusValid: 'Valid',
    realnessStatusInsufficientInfo: 'Insufficient info',
    realnessStatusDummy: 'Dummy',
    realnessStatusTest: 'Test',
    realnessBusinessMeaningValid:
      'High-quality agent. Unlocks full platform analysis and better positioning.',
    realnessBusinessMeaningInsufficientInfo:
      'Basic but incomplete. Limited visibility and no deep analysis.',
    realnessBusinessMeaningDummy:
      'Likely test or spam agent. Strong penalties applied.',
    realnessBusinessMeaningTest: 'Low-quality or experimental agent.',
    realnessStatusInfoAriaLabel: 'More information about this Realness status',
    agentHumiBackToOverview: 'Back to overview',
    agentHumiMissingAgentId: 'Select an agent from the directory to see its HUMI Index.',
    agentHumiGoToDirectory: 'Go to agents directory',
    agentHumiCalculatedAt: 'Index calculated on',
    agentHumiIndexScoreTitle: 'Index Score',
    agentHumiPageTitleSuffix: '(HUMI Index)',
    agentHumiChartTitle: 'Index trend',
    agentHumiTrendTitle: 'Trend',
    agentHumiTrendScopeLabel: 'Trend type',
    agentHumiTrendPeriodLabel: 'Period',
    agentHumiTrendScopeIndex: 'Index Trend',
    agentHumiTrendScopePillar: 'Pillar Trend',
    agentHumiPillarDetailsTitle: 'Pillar Details',
    agentHumiPillarDetailsSelectPillar:
      'Select a pillar in the pillar scores chart to view its executive summary.',
    agentHumiPillarDetailsNoData: 'No executive summary for this pillar.',
    agentHumiPillarDetailsColInformation: 'Information',
    agentHumiPillarDetailsColDescription: 'Description',
    agentHumiPillarDetailsEmpty: 'No information available.',
    agentHumiPillarDetailsKeyStrengths: 'Key strengths',
    agentHumiPillarDetailsMainConcerns: 'Main concerns',
    agentHumiPillarDetailsRecommendation: 'Recommendation',
    agentHumiPillarDetailsOverallAssessment: 'Overall assessment',
    agentHumiPillarDetailsBusinessInterpretation: 'Business interpretation',
    agentHumiChart30d: 'Last 30 changes',
    agentHumiChartMonthly: 'Monthly',
    agentHumiChartEmpty: 'No trend data for this period.',
    agentHumiPillarsTitle: 'Pillar scores',
    agentHumiPillarHistory: 'History (H)',
    agentHumiPillarUsage: 'Usage (U)',
    agentHumiPillarMeasure: 'Measure (M)',
    agentHumiPillarInformation: 'Information (I)',
    agentHumiPillarsEmpty: 'No pillar data for this agent.',
    agentHumiPillarMax: 'of 25',
    agentHumiPillarTrendTitle: 'Pillar trend',
    agentHumiPillarTrendNoDbData: 'No historical data in the database for this pillar.',
    agentHumiPillarTrendSelectPillar:
      'Select a pillar in the pillar scores chart to view its trend.',
    agentHumiPillarSummaryTitle: 'Block breakdown',
    agentHumiPillarBlockBasic: 'Basic',
    agentHumiPillarBlockIntermediate: 'Intermediate',
    agentHumiPillarBlockAdvanced: 'Advanced',
    agentHumiPillarSummaryNoData: 'No breakdown data for this pillar.',
    agentHumiBlockDetailsTitle: 'Block details',
    agentHumiBlockDetailsSelectPillar:
      'Select a pillar in the pillar scores chart to view block-level details.',
    agentHumiBlockDetailsSelectBlock:
      'Select a block in the block breakdown chart to view its items.',
    agentHumiBlockDetailsNoItems: 'No detail items for this block.',
    agentHumiBlockDetailsColItem: 'Item',
    agentHumiBlockDetailsColBusiness: 'Business description',
    agentHumiBlockDetailsColReason: 'Score reason',
    agentHumiBlockDetailsColItemDetails: 'Item Details',
    agentHumiBlockDetailsColScore: 'Score',
    agentHumiBlockDetailsGenericDescription: 'No specific description available.',
    agentHumiBlockDetailsReasonEmpty: 'No reason detail available.',
    agentHumiBlockDetailsItemDetailsEmpty: 'No additional details.',
    agentHumiBlockDetailsTotalLabel: 'Block total',
    agentWamiBackToOverview: 'Back to overview',
    agentWamiMissingAgentId: 'Select an agent from the directory to view its WAMI Index.',
    agentWamiGoToDirectory: 'Go to agent directory',
    agentWamiCalculatedAt: 'Index calculated on',
    agentWamiPageTitleSuffix: '(WAMI Index)',
    agentWamiAgentSummaryTitle: 'Agent summary',
    agentWamiWalletAnalysisTitle: 'Wallets',
    agentWamiWalletMaturityLabel: 'Maturity',
    agentWamiWalletPillarsTitle: 'Wallet pillars',
    agentWamiWalletCarouselLabel: 'Wallet',
    agentWamiWalletCarouselPrev: 'Previous wallet',
    agentWamiWalletCarouselNext: 'Next wallet',
    agentWamiWalletCarouselEmpty: 'No wallets available for this agent.',
    agentWamiWalletCarouselCopy: 'Copy address',
    agentWamiWalletCarouselCopied: 'Address copied.',
    agentWamiTrendTitle: 'Trend',
    agentWamiTrendScopeLabel: 'Trend type',
    agentWamiTrendPeriodLabel: 'Period',
    agentWamiTrendScopeIndex: 'Index trend',
    agentWamiTrendScopePillar: 'Pillar trend',
    agentWamiPillarDetailsTitle: 'Pillar details',
    agentWamiPillarDetailsSelectPillar:
      'Select a pillar in the wallet pillars chart to view its executive summary.',
    agentWamiPillarDetailsNoData: 'No executive summary for this pillar and wallet.',
    agentWamiPillarDetailsColInformation: 'Information',
    agentWamiPillarDetailsColDescription: 'Description',
    agentWamiPillarDetailsEmpty: 'No information available.',
    agentWamiPillarDetailsKeyStrengths: 'Key strengths',
    agentWamiPillarDetailsMainConcerns: 'Main concerns',
    agentWamiPillarDetailsRecommendation: 'Recommendation',
    agentWamiPillarDetailsOverallAssessment: 'Overall assessment',
    agentWamiPillarDetailsBusinessInterpretation: 'Business interpretation',
    agentWamiChart30d: 'Last 30 changes',
    agentWamiChartMonthly: 'Monthly',
    agentWamiChartEmpty: 'No trend data for this period.',
    agentWamiPillarOrigins: 'Origins (O)',
    agentWamiPillarPortfolio: 'Portfolio (P)',
    agentWamiPillarActivity: 'Activity (A)',
    agentWamiPillarMultichain: 'Multi-chain (M)',
    agentWamiPillarsEmpty: 'No pillar data for this wallet.',
    agentWamiPillarMax: 'of 25',
    agentWamiPillarTrendNoDbData: 'No historical data in the database for this pillar.',
    agentWamiPillarTrendSelectPillar:
      'Select a pillar in the wallet pillars chart to view its trend.',
    agentWamiPillarSummaryTitle: 'Block breakdown',
    agentWamiPillarBlockBasic: 'Basic',
    agentWamiPillarBlockIntermediate: 'Intermediate',
    agentWamiPillarBlockAdvanced: 'Advanced',
    agentWamiPillarSummaryNoData: 'No breakdown data for this pillar and wallet.',
    agentWamiBlockDetailsTitle: 'Block details',
    agentWamiBlockDetailsSelectPillar:
      'Select a pillar in the wallet pillars chart to view block-level details.',
    agentWamiBlockDetailsSelectBlock:
      'Select a block in the block breakdown chart to view its items.',
    agentWamiBlockDetailsNoItems: 'No detail items for this block.',
    agentWamiBlockDetailsColItem: 'Item',
    agentWamiBlockDetailsColBusiness: 'Business description',
    agentWamiBlockDetailsColReason: 'Score reason',
    agentWamiBlockDetailsColItemDetails: 'Item Details',
    agentWamiBlockDetailsColScore: 'Score',
    agentWamiBlockDetailsGenericDescription: 'No specific description available.',
    agentWamiBlockDetailsReasonEmpty: 'No reason detail available.',
    agentWamiBlockDetailsItemDetailsEmpty: 'No additional details.',
    agentWamiBlockDetailsTotalLabel: 'Block total',
    agentDetailWeb: 'Web',
    agentDetailEmail: 'Email',
    readMoreDescription: 'Read more',
    descriptionModalTitle: 'Full description',
    closeModal: 'Close',
    agentDetailOnChainData: 'On Chain',
    agentDetailChainLabel: 'Network',
    agentDetailWalletOnChainIdInfo: 'On-chain ID (wallet registration)',
    agentDetailCreatedAt: 'Created at',
    agentDetailOwnerChanges: 'Owner changes',
    agentDetailOwnerWallet: 'Owner wallet',
    agentDetailOwnerSince: 'Owner since',
    agentDetailOwnerCardTitle: 'Owner',
    agentDetailOwnerActivityTitle: 'Activity by network',
    agentDetailOwnerFirstActivity: 'First activity',
    agentDetailOwnerWalletTypeActive: 'Active',
    agentDetailOwnerWalletTypeHolder: 'Holder',
    agentDetailOwnerWalletTypeActiveHelp:
      'The wallet has transactional activity on this network.',
    agentDetailOwnerWalletTypeHolderHelp:
      'The wallet has no transactional activity on this network.',
    agentDetailOwnerWalletTypeInfoAriaLabel: 'More information about wallet type',
    agentDetailOwnerActivityEmpty: 'No activity recorded by network',
    agentDetailOwnerActivityPrev: 'Previous network',
    agentDetailOwnerActivityNext: 'Next network',
    agentDetailMetadataInformation: 'Metadata',
    agentDetailTransactionalData: 'Transactional',
    agentDetailTransactionalWalletTitle: 'Transactional Wallet',
    agentDetailWalletDetailsTitle: 'Wallet details',
    agentDetailTransactionalWalletPrev: 'Previous wallet',
    agentDetailTransactionalWalletNext: 'Next wallet',
    agentDetailTransactionalWalletEmpty: 'No transactional wallets available.',
    agentDetailTransactionalWalletWamiLabel: 'WAMI score',
    agentDetailTransactionalWalletCategoryLabel: 'Category',
    agentDetailWalletCategoryInfoAriaLabel: 'More information about wallet category',
    agentDetailWalletCategoryExplanationFallback:
      'No business explanation for this category.',
    agentDetailFeedbackData: 'Feedback',
    transactionalTabNonce: 'Nonce',
    transactionalTabBalance: 'Balance',
    transactionalNonceCurrentLabel: 'Current nonce',
    transactionalBalanceCurrentLabel: 'Current balance',
    transactionalNonceCurrentHelp:
      'Nonce for the selected wallet (all chains) or the filtered chain.',
    transactionalBalanceCurrentHelp:
      'Native balance of the filtered chain. With “All”, balances are not summed across chains (different tokens).',
    transactionalNonceInfoAriaLabel: 'More information about current nonce',
    transactionalBalanceInfoAriaLabel: 'More information about current balance',
    transactionalChainFilterAll: 'All',
    transactionalBalanceMultiChainLabel: 'Multi-chain',
    transactionalBalanceMultiChainHelp:
      'Balance is not aggregated across chains because each uses its native token. Pick a chain or use the multi-line chart.',
    metadataTabSkills: 'Skills',
    metadataTabSupportedTrust: 'Supported trust',
    metadataTabCapabilities: 'Capabilities',
    metadataTabTags: 'Tags',
    metadataTabOasfSkills: 'OASF skills',
    metadataTabOasfDomains: 'OASF domains',
    metadataTabTechnicalTools: 'Technical tools',
    metadataTabTechnicalPrompts: 'Technical prompts',
    metadataTabTechnicalCapabilities: 'Technical capabilities',
    metadataTabServices: 'Services',
    metadataX402Enabled: 'x402 enabled',
    metadataX402Disabled: 'x402 disabled',
    agentDetailMetadataViewAnalysis: 'Analysis',
    agentDetailMetadataViewData: 'Data',
    agentDetailMetadataRichnessScoreLabel: 'Metadata richness score',
    agentDetailRichnessScoreLabel: 'Richness Score',
    agentDetailRichnessScoreHelp:
      'The Metadata Richness Score is a 0–100 quality metric that evaluates how complete, professional, and sophisticated an agent\'s public profile is.',
    agentDetailRichnessScoreInfoAriaLabel: 'More information about the richness score',
    agentDetailMetadataRichnessTotalLabel: 'Total',
    agentDetailMetadataRichnessCalculatedAt: 'Metadata Last Update',
    agentDetailMetadataLayerRangeBasic: '0–40',
    agentDetailMetadataLayerRangeIntermediate: '40–70',
    agentDetailMetadataLayerRangeAdvanced: '70–100',
    agentDetailMetadataLayerBasic: 'Basic layer',
    agentDetailMetadataLayerIntermediate: 'Intermediate layer',
    agentDetailMetadataLayerAdvanced: 'Advanced layer',
    agentDetailMetadataRichnessEmpty: 'No metadata richness analysis available.',
    agentDetailMetadataRichnessHoverPlaceholder:
      'Hover a segment in the bar charts to see the item label and its score.',
    agentDetailMetadataLayerNoBreakdown: 'No per-item breakdown',
    agentDetailMetadataLayerPrev: 'Previous layer',
    agentDetailMetadataLayerNext: 'Next layer',
    agentDetailMetadataLayerRemaining: 'Remaining',
    agentDetailMetadataLayerRemainingHelp:
      'Points still available in this layer (gap between the layer maximum and the score achieved).',
    agentDetailMetadataItemExplanationFallback:
      'No business explanation is available for this item.',
    agentDetailMetadataItemInfoAriaLabel: 'More information about this metadata item',
    feedbackAxisCommentQuality: 'Comment quality',
    feedbackAxisAttestationQuality: 'Attestation quality',
    feedbackAxisFeedbackVolume: 'Feedback volume',
    feedbackAxisProtocolActivity: 'Protocol activity',
    feedbackAxisExecutionSuccess: 'Execution success',
    feedbackAxisAttestationValidity: 'Attestation validity',
    feedbackAxisPaidProtocolActivity: 'Paid protocol activity',
    feedbackAxisFreshness: 'Freshness',
    agentDetailFeedbackAnalysisEmpty: 'No feedback analysis available.',
    agentDetailFeedbackRadarScale: 'Scale: 0–{max}',
    agentDetailFeedbackRadarStrengthTitle: 'Feedback strength: {avg} (avg. {n} axes)',
    feedbackTabComments: 'Comments',
    feedbackTabAttestations: 'Attestations',
    feedbackTabExternalAudit: 'External audit',
    feedbackTabIdentityAnalysis: 'Identity analysis',
    feedbackTabOnChainExecutions: 'On-chain executions',
    feedbackTabOnChainFeedbacks: 'On-chain feedback',
    feedbackTabProtocolActivity: 'Protocol activity',
    agentDetailCommentsPieValid: 'Valid',
    agentDetailCommentsPieRevoked: 'Revoked',
    agentDetailCommentsPieOther: 'Other',
    agentDetailCommentsTotal: 'Total comments',
    agentDetailCommentsRatio: 'Comments ratio',
    agentDetailCommentsLastRecord: 'Last comment',
    agentDetailAttestationsPieValid: 'Valid',
    agentDetailAttestationsPieSpam: 'Spam',
    agentDetailAttestationsPieRevoked: 'Revoked',
    agentDetailAttestationsPieOther: 'Other',
    agentDetailAttestationsTotal: 'Total attestations',
    agentDetailAttestationsRate: 'Attestations rate',
    agentDetailAttestationsScoreAvg: 'Average score',
    agentDetailAttestationsLastRecord: 'Last attestation',
    agentDetailExternalAuditSourcesTitle: 'External sources',
    agentDetailExternalAuditEntityLabel: 'Entity',
    agentDetailExternalAuditScoreLabel: 'Score',
    agentDetailExternalAuditLastAtLabel: 'Last updated',
    agentDetailExternalAuditPrev: 'Previous source',
    agentDetailExternalAuditNext: 'Next source',
    agentDetailExternalAuditEmpty: 'No external sources to display.',
    agentDetailExternalAuditSourceCount: 'Total sources',
    agentDetailExternalAuditGlobalScore: 'Global score',
    agentDetailExternalAuditLastRecord: 'Last audit',
    agentDetailIdentityScore: 'Identity score',
    agentDetailIdentityStage: 'Identity stage',
    agentDetailIdentityLastRecord: 'Last identity record',
    agentDetailOnChainExecutionCategoriesTitle: 'Execution categories',
    agentDetailOnChainExecutionCategoryLabel: 'Category',
    agentDetailOnChainExecutionCountLabel: 'Count',
    agentDetailOnChainExecutionLastAtLabel: 'Last execution',
    agentDetailOnChainExecutionPrev: 'Previous category',
    agentDetailOnChainExecutionNext: 'Next category',
    agentDetailOnChainExecutionEmpty: 'No execution categories to display.',
    agentDetailOnChainExecutionTotal: 'Total executions',
    agentDetailOnChainExecutionRate: 'Execution rate',
    agentDetailOnChainExecutionLastRecord: 'Last recorded execution',
    agentDetailOnChainFeedbackItemsTitle: 'Feedback by category',
    agentDetailOnChainFeedbackCategoryLabel: 'Category',
    agentDetailOnChainFeedbackSubcategoryLabel: 'Subcategory',
    agentDetailOnChainFeedbackAvgScoreLabel: 'Average score',
    agentDetailOnChainFeedbackPrev: 'Previous item',
    agentDetailOnChainFeedbackNext: 'Next item',
    agentDetailOnChainFeedbackEmpty: 'No feedback items to display.',
    agentDetailOnChainFeedbackTotal: 'Total feedbacks',
    agentDetailOnChainFeedbackRate: 'Feedback rate',
    agentDetailOnChainFeedbackLastRecord: 'Last recorded feedback',
    agentDetailProtocolActivityItemsTitle: 'Protocol activities',
    agentDetailProtocolActivityEntityLabel: 'Entity',
    agentDetailProtocolActivityActivityLabel: 'Activity',
    agentDetailProtocolActivityCountLabel: 'Count',
    agentDetailProtocolActivityAvgScoreLabel: 'Average score',
    agentDetailProtocolActivityRevokeCountLabel: 'Revoked',
    agentDetailProtocolActivityPaymentCountLabel: 'Payments',
    agentDetailProtocolActivitySlideValidRateLabel: 'Valid rate',
    agentDetailProtocolActivitySlidePaymentRateLabel: 'Payment rate',
    agentDetailProtocolActivityLastAtLabel: 'Last activity',
    agentDetailProtocolActivityPrev: 'Previous activity',
    agentDetailProtocolActivityNext: 'Next activity',
    agentDetailProtocolActivityEmpty: 'No protocol activities to display.',
    agentDetailProtocolActivityTotal: 'Total activities',
    agentDetailProtocolActivityGlobalScore: 'Global score',
    agentDetailProtocolActivityGlobalValidRate: 'Global valid rate',
    agentDetailProtocolActivityGlobalPaymentRate: 'Global payment rate',
    agentDetailProtocolActivityLastRecord: 'Last recorded activity',
    agentDetailCopied: 'Copied to clipboard',
    agentDetailNoJsonToShow: 'Nothing to display.',
    chartLabelToday: 'Today',
    chartLabel7d: '7d',
    chartLabel15d: '15d',
    chartLabel1m: '1m',
    chartLabel2m: '2m',
    chartLabel3m: '3m',
    chartLabel6m: '6m',
    chartLabel9m: '9m',
    chartLabel12m: '12m',
    agentDetailProfilesCardTitle: 'Profiles',
    agentDetailWarningsTitle: 'Warnings',
    agentDetailAiAnalysisTitle: 'GSA-AI Analysis',
    agentDetailWarningsEmpty: 'No warnings detected',
    agentDetailWarningInfoAriaLabel: 'More information about this warning',
    agentDetailWarningDuplicationMetadataHelp:
      'When an Agent has almost identical name, description or URI as others. Business impact: Looks like copy-paste or spam. Strong penalty (-2.0).',
    agentDetailWarningMultiAgentWalletHelp:
      'One wallet controlling several Agents at the same time. Business impact: Raises suspicion of Sybil attacks or coordinated behavior. Penalty -1.5.',
    agentDetailWarningDummyMetadataHelp:
      'Agents with very basic, test-like or insufficient information. Business impact: Hard to trust or understand what the Agent actually does.',
    agentDetailWarningAttestationsSpamHelp:
      'When the Agent has received on-chain spam comments or fake feedback. Business impact: Inflated or manipulated reputation. Penalty -2.0.',
    agentDetailWarningExternalAuditWarningHelp:
      'External audits that flagged the Agent as suspicious (sybil or other red flags). Business impact: Independent parties already raised concerns.',
    agentDetailWarningHighRevocationsHelp:
      'Too many feedbacks, comments or attestations being revoked. Business impact: Shows inconsistency or disputes. Penalty -1.5.',
    agentDetailWarningOwnerInactiveAgentsHelp:
      'The wallet behind the Agent has many other Agents that are no longer active. Business impact: Suggests the owner creates and abandons projects frequently.',
    agentDetailWarningHighOwnershipChurnHelp:
      'The Agent has changed owners multiple times and the current one has been there for less than 30 days. Business impact: Lack of long-term commitment or stability.',
    agentDetailWarningTransactionalWalletSameAsOwnerHelp:
      'The same wallet is used both as owner and for heavy transactional activity. Business impact: High risk of the owner using the Agent for self-promotion or manipulation.',
    agentDetailWarningLowerRealnessHelp:
      'The Agent fails to reach a minimum quality threshold in its identity and metadata. Business impact: It\'s hard to verify if this is a real, legitimate Agent.',
    agentDetailWarningLowerMetadataRichnessHelp:
      'The Agent has very little useful information (no services, no skills, no external links, etc.). Business impact: Difficult to understand its real capabilities.',
    governanceTypeLabel: 'Governance type:',
    transactionalDeltaVsPrevious: 'vs previous',

    dashboardChainsEmpty: 'No chain data available.',
    dashboardDataLoading: 'Loading dashboard data…',
    dashboardDataLoadError:
      'No database connection. Check your session or try again later.',
    dashboardDataRetry: 'Retry',
    chainSectionLast30Days: 'Last 30 days',
    chainSectionOwners: 'Owners',
    chainSectionAgentInformation: 'Agent information',
    chainSectionTechnicalMaturity: 'Technical maturity',
    chainPctX402: '% x402',
    chainPctMcpA2a: '% MCP / A2A',
    chainSectionWarnings: 'Warnings',
    chainPctSpam: '% spam',
    chainPctDuplicates: '% duplicates',
    chainOnChainExecutions30d: 'Executions (30d)',
    chainOnChainPayments30d: 'With payments (30d)',
    chainOnChainProtocolActivity30d: 'Protocol activity (30d)',
    chainStatPctActive: '% active',
    chainStatNewAgents30d: 'New agents (30d)',
    chainStatPctWalletActivity: '% with wallet activity',
    chainStatPctOnchainActivity: '% with on-chain activity',
    chainOwnerTotal: 'Total owners',
    chainAvgAgentsPerOwner: 'Avg agents / owner',
    chainChartMonthlyTitle: 'Agents by month',
    chainChartHumiDistributionTitle: 'HUMI distribution',
    chainChartMetadataDistributionTitle: 'Metadata distribution',
    chainDistributionRailHumi: 'HUMI',
    chainDistributionRailMetadata: 'Meta',
    chainDistributionRailWami: 'WAMI',
    chainSectionDistribution: 'Distribution',
    chainDistributionPrev: 'Previous distribution',
    chainDistributionNext: 'Next distribution',
    chainTop10HumiTitle: 'Top 10 agents (HUMI)',
    chainTop10HumiEmpty: 'No HUMI ranking data available.',
    chainWarningDummyMetadata: 'Dummy metadata',
    chainWarningLowerRealness: 'Lower realness',
    chainWarningLowerMetadataRichness: 'Lower metadata richness',
    chainWarningDuplicationMetadata: 'Duplicated metadata',
    chainWarningMultiAgentWallet: 'Multi-agent wallet',
    chainWarningTransactionalWalletSameAsOwner: 'Transactional wallet same as owner',
    chainWarningOwnerInactiveAgents: 'Owner inactive agents',
    chainWarningHighOwnershipChurn: 'High ownership churn',
    chainWarningAttestationsSpam: 'Attestation spam',
    chainWarningHighRevocations: 'High revocations',
    chainWarningExternalAuditWarning: 'External audit warning',
    chainWarningDummyMetadataHelp:
      'Share of agents on this chain with generic or placeholder metadata detected.',
    chainWarningLowerRealnessHelp:
      'Agents showing weak authenticity or identity consistency signals.',
    chainWarningLowerMetadataRichnessHelp:
      'Agents with incomplete or thin metadata compared to the expected standard.',
    chainWarningDuplicationMetadataHelp:
      'Agents sharing duplicated or highly similar metadata with other agents.',
    chainWarningMultiAgentWalletHelp:
      'Agents whose transactional wallet matches wallets used by multiple agents.',
    chainWarningTransactionalWalletSameAsOwnerHelp:
      'Agents whose transactional wallet is the same as the registered owner wallet.',
    chainWarningOwnerInactiveAgentsHelp:
      'Agents whose owner also has other inactive or recently idle agents.',
    chainWarningHighOwnershipChurnHelp:
      'Agents affected by high ownership turnover or frequent owner changes.',
    chainWarningAttestationsSpamHelp:
      'Agents with repetitive or low-quality attestation patterns (spam).',
    chainWarningHighRevocationsHelp:
      'Agents with an elevated ratio of revocations in certifications or attestations.',
    chainWarningExternalAuditWarningHelp:
      'Agents flagged by alerts from external audits or third-party reviews.',
    chainWarningInfoAriaLabel: 'More information about this metric',
    chainDataUpdatedLabel: 'Last data update',
    chainSeriesNewAgents: 'New',
    chainSeriesTotalAgents: 'Total agents',
    chainSeriesActiveAgents: 'Active',
  },
};

interface ContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  applyPersistedPreferences: (preferences: { language?: Language; theme?: Theme }) => void;
}

const Context = createContext<ContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedLang = localStorage.getItem('gsa-language') as Language;
    if (savedLang === 'en' || savedLang === 'es') setLang(savedLang);

    const savedTheme = (localStorage.getItem('gsa-theme') as Theme) || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('gsa-language', newLang);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('gsa-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  const applyPersistedPreferences = useCallback(({
    language,
    theme: persistedTheme,
  }: {
    language?: Language;
    theme?: Theme;
  }) => {
    if (language === 'es' || language === 'en') {
      setLang(language);
      localStorage.setItem('gsa-language', language);
    }

    if (persistedTheme === 'dark' || persistedTheme === 'light') {
      setTheme(persistedTheme);
      localStorage.setItem('gsa-theme', persistedTheme);
      document.documentElement.classList.toggle('dark', persistedTheme === 'dark');
    }
  }, []);

  const value = useMemo(() => ({
    lang,
    t: translations[lang],
    setLanguage,
    theme,
    toggleTheme,
    applyPersistedPreferences,
  }), [lang, setLanguage, theme, toggleTheme, applyPersistedPreferences]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguage() {
  const context = useContext(Context);
  if (!context) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return context;
}