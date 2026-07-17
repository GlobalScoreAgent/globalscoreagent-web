// app/(dashboard)/dashboard/components/DashboardTopNav.tsx

'use client';

import Link from 'next/link';
import { User, Sun, Moon, Menu } from 'lucide-react';
import { performDashboardLogout } from '@/lib/gsa/dashboard-logout';
import { cn } from '@/lib/utils';
import { useLanguage } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SubscriptionStatusTags from './SubscriptionStatusTags';
import { useDashboardLogin } from './DashboardLoginContext';
import { useDashboardTitleOverride } from './DashboardTitleOverrideContext';
import { useDashboardMobileNav } from './DashboardMobileNavContext';
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
  pageTitleKey?: string;
}

export default function DashboardTopNav({ user, profile, pageTitleKey }: Props) {
  const { t, theme, toggleTheme, lang } = useLanguage();
  const { loginReady, isSubscriptionActive, loginMessage } = useDashboardLogin();
  const { titleOverride } = useDashboardTitleOverride();
  const { openMobileNav } = useDashboardMobileNav();

  const handleSignOut = () => {
    void performDashboardLogout();
  };

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Usuario';

  const pageTitle = titleOverride
    ? titleOverride
    : pageTitleKey
      ? t[pageTitleKey as keyof typeof t]
      : t.dashboardTitle;

  const showInactiveSubscriptionBadge = loginReady && !isSubscriptionActive;
  const inactiveSubscriptionMessage =
    (loginMessage
      ? (lang === 'es' ? loginMessage.es : loginMessage.en).trim()
      : '') || t.subscriptionInactiveBadge;

  return (
    <header
      className={cn(
        'flex min-h-16 h-auto items-center gap-3 border-b px-4 py-2 transition-colors md:gap-4 md:px-8',
        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 text-zinc-900',
      )}
    >
      <button
        type="button"
        onClick={openMobileNav}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-colors md:hidden',
          theme === 'dark'
            ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
        )}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 font-semibold tracking-tight">
        {showInactiveSubscriptionBadge ? (
          <span
            role="status"
            title={inactiveSubscriptionMessage}
            className={cn(
              'inline-flex max-w-full truncate rounded-full border px-3 py-1 text-xs font-medium sm:text-sm',
              theme === 'dark'
                ? 'border-red-400/40 bg-red-400/10 text-red-200'
                : 'border-red-500/40 bg-red-50 text-red-800',
            )}
          >
            {inactiveSubscriptionMessage}
          </span>
        ) : (
          <p className="truncate text-base sm:text-lg md:text-2xl">
            <span className="hidden md:inline">{t.platformTitle} - </span>
            {pageTitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-6">
        <div className="hidden md:flex md:items-center md:gap-6">
          <SubscriptionStatusTags />
          <LanguageSwitcher />
        </div>

        <button
          onClick={toggleTheme}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
            theme === 'dark'
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
          )}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 rounded-2xl px-1 py-1 transition-colors focus:outline-none md:gap-3 md:px-2 md:py-1.5',
                theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100',
              )}
            >
              <div className="hidden text-right md:block">
                <p className={cn('text-sm font-medium', theme === 'dark' ? 'text-white' : 'text-zinc-900')}>
                  {displayName}
                </p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>

              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border transition-colors',
                  theme === 'dark' ? 'bg-zinc-700 border-amber-400/30' : 'bg-zinc-200 border-zinc-400',
                )}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className={cn('h-5 w-5', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600')} />
                )}
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className={cn(
              'w-56 rounded-3xl p-2',
              theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900',
            )}
          >
            <div className="px-4 py-2 md:hidden">
              <SubscriptionStatusTags />
            </div>
            <div className="px-4 py-2 md:hidden">
              <LanguageSwitcher />
            </div>
            <DropdownMenuSeparator className="md:hidden" />
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
