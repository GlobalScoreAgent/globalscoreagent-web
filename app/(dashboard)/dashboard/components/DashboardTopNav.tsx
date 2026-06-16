// app/(dashboard)/dashboard/components/DashboardTopNav.tsx

'use client';

import Link from 'next/link';
import { User, Sun, Moon } from 'lucide-react';
import { performDashboardLogout } from '@/lib/gsa/dashboard-logout';
import { useLanguage } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SubscriptionStatusTags from './SubscriptionStatusTags';
import { useDashboardTitleOverride } from './DashboardTitleOverrideContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  user: any;
  profile?: { display_name?: string; avatar_url?: string } | null;
  pageTitleKey?: string;        // ← Clave de traducción
}

export default function DashboardTopNav({ user, profile, pageTitleKey }: Props) {
  const { t, theme, toggleTheme } = useLanguage();
  const { titleOverride } = useDashboardTitleOverride();

  const handleSignOut = () => {
    void performDashboardLogout();
  };

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Usuario';

  return (
    <header className={`min-h-16 h-auto border-b px-8 py-2 flex items-center justify-between transition-colors ${
      theme === 'dark' 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-white border-zinc-200 text-zinc-900'
    }`}>
      
      {/* Título dinámico bilingüe */}
      <div className="font-semibold text-2xl tracking-tight">
        {t.platformTitle} -{' '}
        {titleOverride
          ? titleOverride
          : pageTitleKey
            ? t[pageTitleKey as keyof typeof t]
            : t.dashboardTitle}
      </div>

      <div className="flex items-center gap-6">
        <SubscriptionStatusTags />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-zinc-800/50 focus:outline-none"
            >
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
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className={`w-56 rounded-3xl p-2 ${theme === 'dark'
              ? 'bg-zinc-900 border-zinc-700 text-white'
              : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <DropdownMenuItem asChild>
              <Link href="/dashboard/perfil" className="px-4 py-2.5">
                {t.profile}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/subscripciones" className="px-4 py-2.5">
                {t.subscriptions}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/api" className="px-4 py-2.5">
                {t.api}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/feedbacks" className="px-4 py-2.5">
                {t.feedbacks}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleSignOut();
              }}
              className="px-4 py-2.5 text-red-400 focus:text-red-400"
            >
              {t.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}