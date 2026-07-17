'use client';

import { useEffect } from 'react';
import { DashboardStatusVideo } from '@/components/dashboard/DashboardStatusVideo';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';

const BUILDING_VIDEO = '/animations/agent-building.mp4';

type Props = {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  t: Translations;
};

export function DashboardComingSoonModal({ open, onClose, isDark, t }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isDark ? 'bg-black/70' : 'bg-black/40'
      }`}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-modal-title"
        className={`w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl ${
          isDark ? 'border border-zinc-700 bg-zinc-900' : 'border border-zinc-200 bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-h-[min(42vh,16rem)] w-full overflow-hidden">
          <DashboardStatusVideo
            src={BUILDING_VIDEO}
            label={t.comingSoon}
            isDark={isDark}
            className="h-[min(42vh,16rem)]"
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <h2
            id="coming-soon-modal-title"
            className={`text-lg font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
          >
            {t.comingSoon}
          </h2>
          <button
            type="button"
            className={`rounded-xl border px-4 py-2 text-sm ${
              isDark
                ? 'border-zinc-600 hover:bg-white/10'
                : 'border-zinc-300 hover:bg-zinc-100'
            }`}
            onClick={onClose}
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
}
