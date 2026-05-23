'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiCopy } from '@/content/humi/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function HumiComparisonSection() {
  const { language } = useLanguage();
  const { comparison } = humiCopy;
  const { tableHeaders } = comparison;

  return (
    <SectionSurface id="comparison" tone="dark">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, comparison.title)}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                <th className="px-4 py-3 font-medium">{pick(language, tableHeaders.index)}</th>
                <th className="px-4 py-3 font-medium">{pick(language, tableHeaders.provider)}</th>
                <th className="px-4 py-3 font-medium">{pick(language, tableHeaders.focus)}</th>
                <th className="px-4 py-3 font-medium">{pick(language, tableHeaders.scoreRange)}</th>
                <th className="px-4 py-3 font-medium">{pick(language, tableHeaders.dataUsed)}</th>
                <th className="px-4 py-3 font-medium">{pick(language, tableHeaders.advantage)}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3 font-medium text-white">{pick(language, row.name)}</td>
                  <td className="px-4 py-3 text-zinc-300">{pick(language, row.provider)}</td>
                  <td className="px-4 py-3 text-zinc-300">{pick(language, row.focus)}</td>
                  <td className="px-4 py-3 text-zinc-400">{pick(language, row.scoreRange)}</td>
                  <td className="px-4 py-3 text-zinc-400">{pick(language, row.dataUsed)}</td>
                  <td className="px-4 py-3 text-gold/90">{pick(language, row.advantage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h3 className="mb-4 text-xl font-semibold text-gold">
            {pick(language, comparison.standOutTitle)}
          </h3>
          <ul className="space-y-3">
            {comparison.standOut.map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-gold">•</span>
                <span>{pick(language, item)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionSurface>
  );
}
