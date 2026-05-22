'use client';

import { useCallback, useId, useRef, useState, type FocusEvent } from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { Bilingual } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';

type KpiInfoTooltipProps = {
  content: Bilingual;
  ariaLabel: Bilingual;
  className?: string;
};

export default function KpiInfoTooltip({ content, ariaLabel, className = '' }: KpiInfoTooltipProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const handleBlur = (e: FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      close();
    }
  };

  return (
    <span
      ref={rootRef}
      className={`relative inline-flex shrink-0 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="rounded p-0.5 text-zinc-500 transition-colors hover:text-gold/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
        aria-label={pick(language, ariaLabel)}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full right-0 z-30 mb-1 max-w-[11rem] rounded-md border border-white/10 bg-zinc-900/95 px-2 py-1 text-left text-[10px] leading-snug text-zinc-200 shadow-lg backdrop-blur-sm transition-opacity sm:max-w-[12rem] sm:text-xs ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {pick(language, content)}
      </span>
    </span>
  );
}
