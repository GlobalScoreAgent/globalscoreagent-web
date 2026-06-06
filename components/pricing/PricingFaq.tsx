'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';

export default function PricingFaq() {
  const { language } = useLanguage();
  const { faq } = pricingCopy;

  return (
    <section>
      <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
        {pick(language, faq.title)}
      </h2>
      <div className="space-y-3">
        {faq.items.map((item, index) => (
          <details
            key={index}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 open:bg-zinc-900/80"
          >
            <summary className="cursor-pointer list-none text-base font-medium text-white marker:content-none md:text-lg [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {pick(language, item.question)}
                <span className="text-xl text-gold transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-base leading-relaxed text-zinc-400 md:text-lg">
              {pick(language, item.answer)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
