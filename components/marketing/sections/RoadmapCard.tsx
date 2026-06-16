'use client';

import Image from 'next/image';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import type { RoadmapFeature } from '@/lib/web-page/roadmap-features';
import GlassCard from '../shared/GlassCard';

function formatCompletedAt(iso: string, lang: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(iso));
}

type RoadmapCardProps = {
  feature: RoadmapFeature;
  language: 'es' | 'en';
};

export default function RoadmapCard({ feature, language }: RoadmapCardProps) {
  const { roadmap } = marketingCopy;
  const typeName = language === 'es' ? feature.type_name_es : feature.type_name_en;
  const description = language === 'es' ? feature.description_es : feature.description_en;

  return (
    <GlassCard
      variant="elevated"
      className={`flex h-full w-full min-w-[16rem] max-w-sm flex-col ${
        feature.is_completed ? 'border-emerald-500/40 opacity-95' : ''
      }`}
    >
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-gold/15 bg-black/40">
        <Image
          src={feature.image_src}
          alt={typeName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 320px"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-200">
          {typeName}
        </span>
        {feature.is_completed && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {pick(language, roadmap.completed)}
          </span>
        )}
      </div>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-300">{description}</p>

      <div className="mt-auto space-y-1 border-t border-white/5 pt-3 text-xs">
        <p className="font-medium text-zinc-500">{pick(language, roadmap.expectedDeploy)}</p>
        <p className="text-zinc-300">{feature.expected_deploy}</p>
        {feature.is_completed && feature.completed_at && (
          <p className="text-emerald-400/90">
            {pick(language, roadmap.completedOn)}{' '}
            {formatCompletedAt(feature.completed_at, language)}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
