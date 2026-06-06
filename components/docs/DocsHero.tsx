'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { docsCopy } from '@/content/docs/copy';
import { pick } from '@/content/marketing/i18n';

type DocsHeroProps = {
  pageTitle: string;
};

export default function DocsHero({ pageTitle }: DocsHeroProps) {
  const { language } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {pick(language, docsCopy.hero.title)}
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-zinc-400 md:text-xl">
        {pageTitle}
      </p>
    </div>
  );
}
