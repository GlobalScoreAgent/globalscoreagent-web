'use client';

import { Clock, Activity, BarChart3, FileText, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiCopy, type HumiPillar } from '@/content/humi/copy';
import { pick } from '@/content/marketing/i18n';

const iconMap = {
  history: Clock,
  information: FileText,
  measure: BarChart3,
  usage: Activity,
} as const;

type HumiPillarFlipCardProps = {
  pillar: HumiPillar;
  isFlipped: boolean;
  onFlip: () => void;
};

export default function HumiPillarFlipCard({ pillar, isFlipped, onFlip }: HumiPillarFlipCardProps) {
  const { language } = useLanguage();
  const Icon = iconMap[pillar.id];
  const { flipHint, flipBack, pointsLabel } = humiCopy.pillars;
  const pillarTitle = pick(language, pillar.title);
  const flipAction = pick(language, isFlipped ? flipBack : flipHint);

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-expanded={isFlipped}
      aria-label={`${pillarTitle} — ${flipAction}`}
      className="group relative h-[22rem] w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:h-80"
      style={{ perspective: '1500px' }}
    >
      <div
        className="relative h-full w-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          aria-hidden={isFlipped}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border border-gold/30 p-4 shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(180deg, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.85) 100%)',
          }}
        >
          <Icon className="mb-3 text-gold" size={32} />
          <h3 className="text-center text-2xl font-semibold text-white">
            {pick(language, pillar.title)}
          </h3>
          <span className="mt-2 rounded-xl bg-amber-400 px-3 py-1 text-sm font-bold text-black">
            25 {pick(language, pointsLabel)}
          </span>
          <p className="mt-4 line-clamp-3 text-center text-sm text-zinc-300">
            {pick(language, pillar.summary)}
          </p>
          <span className="mt-4 flex items-center gap-1 text-xs text-gold/80">
            <RotateCcw size={14} />
            {pick(language, flipHint)}
          </span>
        </div>

        {/* Back */}
        <div
          aria-hidden={!isFlipped}
          className="absolute inset-0 z-10 flex flex-col rounded-2xl border border-gold/40 p-4 shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(180deg, rgba(9,9,11,0.98) 0%, rgba(9,9,11,0.9) 100%)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <Icon className="text-gold" size={24} />
            <span className="text-xs text-gold/70">{pick(language, flipBack)}</span>
          </div>
          <ul className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
            {pillar.criteria.map((criterion, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2 last:border-0"
              >
                <span className="leading-snug text-zinc-300">{pick(language, criterion.label)}</span>
                <span className="shrink-0 font-mono text-xs font-semibold text-gold">
                  {criterion.points}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}
