'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function parseLangParam(value: string | null): Language | null {
  if (value === 'en' || value === 'es') return value;
  return null;
}

function readLangFromUrl(): Language | null {
  if (typeof window === 'undefined') return null;
  return parseLangParam(new URLSearchParams(window.location.search).get('lang'));
}

function syncLangToUrl(lang: Language) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (lang === 'es') {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', lang);
  }
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const fromUrl = readLangFromUrl();
    if (fromUrl) setLanguage(fromUrl);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'es' ? 'en' : 'es';
      syncLangToUrl(next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
