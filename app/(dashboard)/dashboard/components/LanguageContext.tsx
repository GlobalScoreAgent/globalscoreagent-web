// app/(dashboard)/dashboard/components/LanguageContext.tsx
// Contexto combinado: Idioma + Tema Claro/Oscuro

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'es' | 'en';
type Theme = 'dark' | 'light';

interface Translations {
  // Sidebar
  home: string;
  agents: string;
  humiIndex: string;
  certifications: string;
  cerex: string;
  cerow: string;
  logout: string;

  // Top Nav
  dashboardTitle: string;
  platformTitle: string;
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
}

const translations: Record<Language, Translations> = {
  es: {
    home: 'Home',
    agents: 'Agentes',
    humiIndex: 'HUMI Index',
    certifications: 'Certificaciones',
    cerex: 'CEREX',
    cerow: 'CEROW',
    logout: 'Cerrar Sesión',

    dashboardTitle: 'Dashboard',
    platformTitle: 'GSA Platform',
    searchPlaceholder: 'Buscar agentes o certificaciones...',
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
  },
  en: {
    home: 'Home',
    agents: 'Agents',
    humiIndex: 'HUMI Index',
    certifications: 'Certifications',
    cerex: 'CEREX',
    cerow: 'CEROW',
    logout: 'Log Out',

    dashboardTitle: 'Dashboard',
    platformTitle: 'GSA Platform',
    searchPlaceholder: 'Search agents or certifications...',
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
    dashboardOverviewTitle: 'Overview ERC-8004 Ecosystem'
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