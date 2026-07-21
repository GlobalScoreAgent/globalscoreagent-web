'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertPreviewVsPaidSection() {
  const { language } = useLanguage();
  const { previewVsPaid } = walcertCopy;

  return (
    <SectionSurface id="preview-vs-paid" tone="dark">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, previewVsPaid.title)}
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base text-zinc-400">
          {pick(language, previewVsPaid.intro)}
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-black/40">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="px-4 py-3 font-medium">
                  {pick(language, previewVsPaid.columns.feature)}
                </th>
                <th className="px-4 py-3 font-medium">
                  {pick(language, previewVsPaid.columns.preview)}
                </th>
                <th className="px-4 py-3 font-medium text-gold">
                  {pick(language, previewVsPaid.columns.paid)}
                </th>
              </tr>
            </thead>
            <tbody>
              {previewVsPaid.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800/60 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-zinc-300">
                    {pick(language, row.feature)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {pick(language, row.preview)}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">
                    {pick(language, row.paid)}
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
