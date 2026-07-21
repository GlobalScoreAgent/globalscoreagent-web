'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertDevEndpointsSection() {
  const { language } = useLanguage();
  const { endpoints } = walcertDevelopersCopy;

  return (
    <SectionSurface id="endpoints" tone="darker">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
          {pick(language, endpoints.title)}
        </h2>
        <p className="mb-8 font-mono text-sm text-zinc-500">
          {pick(language, endpoints.intro)}
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-black/40">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="px-4 py-3 font-medium">
                  {pick(language, endpoints.columns.method)}
                </th>
                <th className="px-4 py-3 font-medium">
                  {pick(language, endpoints.columns.path)}
                </th>
                <th className="px-4 py-3 font-medium">
                  {pick(language, endpoints.columns.auth)}
                </th>
                <th className="px-4 py-3 font-medium">
                  {pick(language, endpoints.columns.delivers)}
                </th>
              </tr>
            </thead>
            <tbody>
              {endpoints.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-gold">{row.method}</td>
                  <td className="px-4 py-3 font-mono text-zinc-200">{row.path}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {pick(language, row.auth)}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {pick(language, row.delivers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionSurface>
  );
}
