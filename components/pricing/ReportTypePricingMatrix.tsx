'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';

export default function ReportTypePricingMatrix() {
  const { language } = useLanguage();
  const { columns, rows } = pricingCopy.sections.reportTypeByPlan;

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800">
      <table className="min-w-[56rem] w-full text-left text-sm">
        <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-semibold">{pick(language, columns.reportType)}</th>
            <th className="px-4 py-3 font-semibold">{pick(language, columns.direct)}</th>
            <th className="px-4 py-3 font-semibold">{pick(language, columns.starter)}</th>
            <th className="px-4 py-3 font-semibold">{pick(language, columns.growth)}</th>
            <th className="px-4 py-3 font-semibold">{pick(language, columns.pro)}</th>
            <th className="px-4 py-3 font-semibold">{pick(language, columns.enterprise)}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-4 font-medium text-zinc-200">
                {pick(language, row.reportType)}
              </td>
              <td className="px-4 py-4 text-gold">{row.direct}</td>
              <td className="px-4 py-4 text-zinc-300">{pick(language, row.starter)}</td>
              <td className="px-4 py-4 text-zinc-300">{pick(language, row.growth)}</td>
              <td className="px-4 py-4 text-zinc-300">{pick(language, row.pro)}</td>
              <td className="px-4 py-4 text-zinc-300">{pick(language, row.enterprise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
