// app/(dashboard)/dashboard/components/DashboardTopNav.tsx

'use client';

import { User, Sun, Moon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  user: any;
  profile?: { display_name?: string; avatar_url?: string } | null;
  pageTitleKey?: string;        // ← Clave de traducción
}

export default function DashboardTopNav({ user, profile, pageTitleKey }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { t, theme, toggleTheme } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Usuario';

  return (
    <header className={`h-16 border-b px-8 flex items-center justify-between transition-colors ${
      theme === 'dark' 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-white border-zinc-200 text-zinc-900'
    }`}>
      
      {/* Título dinámico bilingüe */}
      <div className="font-semibold text-2xl tracking-tight">
        GSA Platform - {pageTitleKey ? t[pageTitleKey] : 'Dashboard'}
      </div>

      <div className="flex items-center gap-6">
        <LanguageSwitcher />

        <button
          onClick={toggleTheme}
          className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-colors ${
            theme === 'dark' 
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3 group relative">
          <div className="text-right">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {displayName}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
              {user.email}
            </p>
          </div>

          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${
            theme === 'dark' 
              ? 'bg-zinc-700 border-amber-400/30' 
              : 'bg-zinc-200 border-zinc-400'
          }`}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
            )}
          </div>

          <div className={`absolute right-0 top-12 hidden group-hover:block border shadow-2xl w-56 py-2 z-50 rounded-3xl transition-colors ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-zinc-700' 
              : 'bg-white border-zinc-200'
          }`}>
            <a href="/dashboard/perfil" className={`block px-6 py-3 text-sm hover:bg-zinc-800 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.profile}</a>
            <a href="/dashboard/configuracion" className={`block px-6 py-3 text-sm hover:bg-zinc-800 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.settings}</a>
            <a href="/dashboard/subscripciones" className={`block px-6 py-3 text-sm hover:bg-zinc-800 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.subscriptions}</a>
            <a href="/dashboard/uso" className={`block px-6 py-3 text-sm hover:bg-zinc-800 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.usage}</a>
            <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'}`}></div>
            <button onClick={handleSignOut} className="block w-full text-left px-6 py-3 text-sm text-red-400 hover:bg-zinc-800">
              {t.signOut}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}