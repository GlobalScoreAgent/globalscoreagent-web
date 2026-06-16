'use client';

import { useEffect } from 'react';
import { useLanguage as useMarketingLanguage } from '@/app/contexts/LanguageContext';
import { useLanguage as useDashboardLanguage } from '@/app/(dashboard)/dashboard/components/LanguageContext';

export default function PublicAgentLanguageSync({ children }: { children: React.ReactNode }) {
  const { language: marketingLang } = useMarketingLanguage();
  const { setLanguage } = useDashboardLanguage();

  useEffect(() => {
    setLanguage(marketingLang);
  }, [marketingLang, setLanguage]);

  return <>{children}</>;
}
