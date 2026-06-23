'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { ChainDesktopCard } from '@/components/dashboard/chain/ChainDesktopCard';
import { ChainCardsStack } from '@/components/dashboard/chain/ChainModuleCards';
import { ChainSelector } from '@/components/dashboard/chain/ChainSelector';
import { chainAccentColor, type DashboardChainRow } from '@/lib/dashboardChains';

type Props = {
  chains: DashboardChainRow[];
  isDark: boolean;
  t: Translations;
  lang: 'es' | 'en';
};

function ChainEmptyState({ isDark, message }: { isDark: boolean; message: string }) {
  return (
    <div
      className={`flex min-h-[120px] items-center justify-center rounded-3xl border p-8 text-sm ${
        isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'
      }`}
    >
      <p className={isDark ? 'text-zinc-500' : 'text-zinc-600'}>{message}</p>
    </div>
  );
}

export function DashboardChainCards({ chains, isDark, t, lang }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex((i) => {
      if (chains.length === 0) return 0;
      return Math.min(i, chains.length - 1);
    });
  }, [chains.length]);

  if (!chains.length) {
    return <ChainEmptyState isDark={isDark} message={t.dashboardChainsEmpty} />;
  }

  const active = chains[selectedIndex];
  if (!active) {
    return <ChainEmptyState isDark={isDark} message={t.dashboardChainsEmpty} />;
  }

  return (
    <>
      <div className="flex w-full flex-col md:hidden">
        <ChainSelector
          chains={chains}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          isDark={isDark}
        />
        <motion.div
          key={active.chain_id}
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <ChainCardsStack chain={active} lang={lang} isDark={isDark} t={t} />
        </motion.div>
      </div>

      <div className="hidden w-full flex-col items-center gap-6 md:flex">
        <motion.div
          key={active.chain_id}
          className="w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChainDesktopCard chain={active} isDark={isDark} t={t} lang={lang} />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {chains.map((c, index) => (
            <button
              key={c.chain_id}
              type="button"
              aria-label={c.name}
              title={c.short_name || c.name}
              onClick={() => setSelectedIndex(index)}
              className={`h-4 w-4 rounded-full transition-all duration-300 ${
                selectedIndex === index
                  ? 'scale-125 shadow-lg'
                  : `bg-zinc-600 hover:bg-zinc-500 ${isDark ? 'hover:bg-zinc-400' : 'hover:bg-zinc-500'}`
              }`}
              style={{
                backgroundColor: selectedIndex === index ? chainAccentColor(c.chain_id) : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
