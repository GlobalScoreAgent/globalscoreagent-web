// app/(dashboard)/dashboard/components/LanguageSwitcher.tsx
// Switcher de idioma con soporte completo para tema claro/oscuro

'use client';

import { useLanguage } from './LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLanguage, theme } = useLanguage();

  return (
    <div className={`flex items-center gap-1 border rounded-3xl p-1 transition-colors ${
      theme === 'dark' 
        ? 'bg-zinc-800 border-zinc-700' 
        : 'bg-zinc-100 border-zinc-300'
    }`}>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1 text-xs font-medium rounded-3xl transition-all ${
          lang === 'es'
            ? theme === 'dark'
              ? 'bg-amber-400 text-zinc-950'
              : 'bg-amber-500 text-white'
            : theme === 'dark'
            ? 'text-zinc-400 hover:text-white'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-medium rounded-3xl transition-all ${
          lang === 'en'
            ? theme === 'dark'
              ? 'bg-amber-400 text-zinc-950'
              : 'bg-amber-500 text-white'
            : theme === 'dark'
            ? 'text-zinc-400 hover:text-white'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        EN
      </button>
    </div>
  );
}