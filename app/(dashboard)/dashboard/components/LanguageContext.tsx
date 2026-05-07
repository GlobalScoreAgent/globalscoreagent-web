// app/(dashboard)/dashboard/components/LanguageContext.tsx
// Contexto combinado: Idioma + Tema Claro/Oscuro

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'es' | 'en';
type Theme = 'dark' | 'light';

interface Translations {
  // Sidebar
  home: string;
  agentsDirectory: string;
  humiIndex: string;
  certifications: string;
  roadMap: string;
  cerex: string;
  cerow: string;
  logout: string;

  // Platform
  platformTitle: string;

  // Top Nav
  dashboardTitle: string;
  searchPlaceholder: string;
  profile: string;
  settings: string;
  subscriptions: string;
  usage: string;
  signOut: string;

  // Página principal
  welcomeTitle: string;
  welcomeSubtitle: string;
  registeredAgents: string;
  activeAgents: string;
  agentsWithFeedback: string;
  monitoredWallets: string;
  humiDistributionTitle: string;
  cerowTitle: string;           // ← Nuevo
  cerexTitle: string;           // ← Nuevo
  comingSoon: string;           // ← Nuevo
  dashboardOverviewTitle: string;
  humiElite: string;
  humiHighPerformance: string;
  humiStable: string;
  humiModerateRisk: string;
  humiCritical: string;

  // Dashboard - Cards y elementos
  humiIndexTitle: string;
  metadataRichnessTitle: string;
  agentNonceTitle: string;
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
    metadataElite: string;
    metadataExcellent: string;
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
  searchRetry: string;
}

const translations: Record<Language, Translations> = {
  es: {
    home: 'Inicio',
    agentsDirectory: 'Directorio de Agentes',
    humiIndex: 'Índice HUMI',
    certifications: 'Certificaciones',
    roadMap: 'Próximas Funcionalidades',
    cerex: 'CEREX',
    cerow: 'CEROW',
    logout: 'Cerrar Sesión',

    dashboardTitle: 'Dashboard',
    platformTitle: 'GSA Plataforma',
    searchPlaceholder: 'Buscar agentes...',
    profile: 'Perfil',
    settings: 'Configuración',
    subscriptions: 'Subscripciones',
    usage: 'Uso',
    signOut: 'Cerrar sesión',

    welcomeTitle: 'Bienvenido!',
    welcomeSubtitle: 'Resumen General Ecosistema ERC-8004',
    registeredAgents: 'Agentes Registrados',
    activeAgents: 'Agentes Activos',
    agentsWithFeedback: 'Agentes con Feedback',
    monitoredWallets: 'Wallets Monitoreadas',
    humiDistributionTitle: 'Distribución Índice HUMI',
    cerowTitle: 'Certificado de Owner',
    cerexTitle: 'Certificado de Existencia',
    comingSoon: 'Próximamente',
    dashboardOverviewTitle: 'Resumen General Ecosistema ERC-8004',
    humiElite: 'Elite',
    humiHighPerformance: 'Alto Rendimiento',
    humiStable: 'Estables',
    humiModerateRisk: 'Riesgo Moderado',
    humiCritical: 'Críticos',

    // Dashboard - Cards y elementos
    humiIndexTitle: 'Indice',
    metadataRichnessTitle: 'Riqueza Metadata',
    agentNonceTitle: 'Agente Nonce',
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
    metadataElite: 'Elite',
    metadataExcellent: 'Excelente',
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
    searchRetry: 'Reintentar',

  },
  en: {
    home: 'Home',
    agentsDirectory: 'Agents Directory',
    humiIndex: 'HUMI Index',
    certifications: 'Certifications',
    roadMap: 'Road Map',
    cerex: 'CEREX',
    cerow: 'CEROW',
    logout: 'Log Out',

    dashboardTitle: 'Dashboard',
    platformTitle: 'GSA Platform',
    searchPlaceholder: 'Search agents...',
    profile: 'Profile',
    settings: 'Settings',
    subscriptions: 'Subscriptions',
    usage: 'Usage',
    signOut: 'Sign Out',

    welcomeTitle: 'Welcome!',
    welcomeSubtitle: 'General Overview ERC-8004 Ecosystem',
    registeredAgents: 'Registered Agents',
    activeAgents: 'Active Agents',
    agentsWithFeedback: 'Agents with Feedback',
    monitoredWallets: 'Monitored Wallets',
    humiDistributionTitle: 'HUMI Index Distribution',
    cerowTitle: 'Owner Certificate',
    cerexTitle: 'Existence Certificate',
    comingSoon: 'Coming Soon',
    dashboardOverviewTitle: 'Overview ERC-8004 Ecosystem',
    humiElite: 'Elite',
    humiHighPerformance: 'High Performance',
    humiStable: 'Stable',
    humiModerateRisk: 'Moderate Risk',
    humiCritical: 'Critical',

    // Dashboard - Cards y elementos
    humiIndexTitle: 'Index',
    metadataRichnessTitle: 'Metadata Richness',
    agentNonceTitle: 'Agent Nonce',
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
    metadataElite: 'Elite',
    metadataExcellent: 'Excellent',
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
    searchRetry: 'Retry',
  },
};

interface ContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Context = createContext<ContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedLang = localStorage.getItem('gsa-language') as Language;
    if (savedLang) setLang(savedLang);

    const savedTheme = (localStorage.getItem('gsa-theme') as Theme) || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('gsa-language', newLang);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('gsa-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const value = { lang, t: translations[lang], setLanguage, theme, toggleTheme };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguage() {
  const context = useContext(Context);
  if (!context) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return context;
}