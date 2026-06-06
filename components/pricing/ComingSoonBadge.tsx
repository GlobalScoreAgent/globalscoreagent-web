'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';

export default function ComingSoonBadge() {
  const { language } = useLanguage();

  return (
    <span className="rounded-md border border-gold/50 bg-gold/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gold">
      {pick(language, pricingCopy.comingSoonBadge)}
    </span>
  );
}
