// app/(dashboard)/dashboard/components/DashboardSidebar.tsx
// Sidebar con soporte completo para tema claro y oscuro

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import {
  LogOut,
  Home,
  Users,
  Boxes,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { performDashboardLogout } from '@/lib/gsa/dashboard-logout';
import { cn } from '@/lib/utils';
import { useDashboardLogin } from './DashboardLoginContext';
import { useLanguage } from './LanguageContext';
import { useAgentRecentNavigation } from './AgentRecentNavigationContext';
import { useDashboardMobileNav } from './DashboardMobileNavContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', labelKey: 'home' as const, icon: Home },
  { href: '/dashboard/chains', labelKey: 'blockchains' as const, icon: Boxes },
  { href: '/dashboard/agents', labelKey: 'agentsDirectory' as const, icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { t, theme } = useLanguage();
  const { mobileNavOpen, closeMobileNav } = useDashboardMobileNav();
  const { recentAgents, favoriteAgents, closeRecentAgent, addFavorite, removeFavorite, isFavorite } =
    useAgentRecentNavigation();
  const { subscription } = useDashboardLogin();
  const navDisabled = subscription === 'Disable';
  const recentAgentsFiltered = recentAgents.filter((agent) => !isFavorite(agent.id));

  const [isCollapsed, setIsCollapsed] = useState(false);
  const showExpanded = !isCollapsed || mobileNavOpen;

  const handleLogout = () => {
    void performDashboardLogout();
  };

  const handleNavClick = () => {
    closeMobileNav();
  };

  const handleDisabledNavClick = (event: MouseEvent) => {
    event.preventDefault();
  };

  const navDisabledClass = navDisabled
    ? 'pointer-events-none opacity-50 cursor-not-allowed'
    : '';

  const navRowLayout = showExpanded
    ? 'gap-3 px-4'
    : 'justify-center gap-0 px-2 min-h-[2.75rem]';

  const shellClass =
    theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800'
      : 'bg-white border-zinc-200 text-zinc-900';

  const logoSrc =
    theme === 'light'
      ? '/logo-gsa-dashboard-claro.png'
      : '/logo-gsa-dashboard-oscuro.png';

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r transition-transform duration-300',
        shellClass,
        'fixed inset-y-0 left-0 z-50 md:static md:z-auto md:translate-x-0',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        !showExpanded && 'md:w-16',
        showExpanded && 'md:w-64',
      )}
      aria-hidden={!mobileNavOpen ? undefined : false}
    >
      <div
        className={cn(
          'border-b flex items-center',
          showExpanded ? 'gap-3 px-4 py-6' : 'justify-center px-2 py-5',
          theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200',
        )}
      >
        <img
          src={logoSrc}
          alt="Global Score Agent"
          className={cn(
            'transition-all object-contain object-center',
            showExpanded ? 'h-12 w-auto' : 'mx-auto h-10 max-h-10 w-auto max-w-[2.75rem]',
          )}
        />
        {showExpanded && (
          <div className="min-w-0 flex-1 flex-col leading-none">
            <span className="text-2xl font-semibold tracking-tighter">Global Score</span>
            <span className="text-2xl font-semibold tracking-tighter -mt-1">Agent</span>
          </div>
        )}
        <button
          type="button"
          onClick={closeMobileNav}
          className={cn(
            'rounded-xl p-2 transition-colors md:hidden',
            theme === 'dark'
              ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
          )}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={cn('hidden py-2 md:flex', showExpanded ? 'justify-end px-4' : 'justify-center px-2')}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-2 rounded-xl transition-colors',
            theme === 'dark'
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 md:py-6 space-y-1">
          {navItems.map((item) => {
            const isAgentsNav = item.href === '/dashboard/agents';
            const isActive = isAgentsNav
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : pathname === item.href;

            if (isAgentsNav) {
              return (
                <div key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    onClick={(event) => {
                      if (navDisabled) {
                        handleDisabledNavClick(event);
                        return;
                      }
                      handleNavClick();
                    }}
                    aria-disabled={navDisabled}
                    tabIndex={navDisabled ? -1 : undefined}
                    title={!showExpanded ? t[item.labelKey] : undefined}
                    className={cn(
                      'flex items-center py-3 rounded-2xl text-sm font-medium transition-colors',
                      navRowLayout,
                      navDisabledClass,
                      isActive
                        ? theme === 'dark'
                          ? 'bg-zinc-800 text-amber-400'
                          : 'bg-zinc-100 text-amber-600'
                        : theme === 'dark'
                          ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {showExpanded && <span>{t[item.labelKey]}</span>}
                  </Link>
                  {showExpanded && (recentAgentsFiltered.length > 0 || favoriteAgents.length > 0) && (
                    <div
                      className={cn(
                        'ml-2 pl-3 border-l space-y-0.5 pt-1 pb-1',
                        theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200',
                      )}
                    >
                      {favoriteAgents.length > 0 && (
                        <>
                          <p
                            className={cn(
                              'px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide',
                              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400',
                            )}
                          >
                            {t.favoriteAgentsSubmenu}
                          </p>
                          {favoriteAgents.map((agent) => {
                            const detailPath = `/dashboard/agents/${agent.id}`;
                            const isAgentActive = pathname === detailPath;
                            return (
                              <div
                                key={`favorite-${agent.id}`}
                                className={cn(
                                  'group flex items-center gap-0.5 rounded-xl pl-1 pr-0.5',
                                  isAgentActive
                                    ? theme === 'dark'
                                      ? 'bg-zinc-800/80'
                                      : 'bg-zinc-100'
                                    : '',
                                )}
                              >
                                <Link
                                  href={detailPath}
                                  onClick={(event) => {
                                    if (navDisabled) {
                                      handleDisabledNavClick(event);
                                      return;
                                    }
                                    handleNavClick();
                                  }}
                                  aria-disabled={navDisabled}
                                  tabIndex={navDisabled ? -1 : undefined}
                                  title={agent.label}
                                  className={cn(
                                    'min-w-0 flex-1 truncate py-1.5 px-2 text-xs font-medium transition-colors',
                                    navDisabledClass,
                                    isAgentActive
                                      ? theme === 'dark'
                                        ? 'text-amber-400'
                                        : 'text-amber-700'
                                      : theme === 'dark'
                                        ? 'text-zinc-300 hover:text-zinc-100'
                                        : 'text-zinc-700 hover:text-zinc-900',
                                  )}
                                >
                                  {agent.label}
                                </Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className={cn(
                                        'shrink-0 rounded-lg p-1.5 transition-colors outline-none',
                                        theme === 'dark'
                                          ? 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
                                          : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900',
                                      )}
                                      aria-label={t.agentMenuAria}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className={cn(
                                      'min-w-[10rem]',
                                      theme === 'dark'
                                        ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                                        : 'bg-white border-zinc-200 text-zinc-900',
                                    )}
                                  >
                                    <DropdownMenuItem onSelect={() => void removeFavorite(agent.id)}>
                                      {t.unfavoriteAgent}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {recentAgentsFiltered.length > 0 && (
                        <p
                          className={cn(
                            'px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide',
                            theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400',
                          )}
                        >
                          {t.recentAgentsSubmenu}
                        </p>
                      )}
                      {recentAgentsFiltered.map((agent) => {
                        const detailPath = `/dashboard/agents/${agent.id}`;
                        const isAgentActive = pathname === detailPath;
                        return (
                          <div
                            key={agent.id}
                            className={cn(
                              'group flex items-center gap-0.5 rounded-xl pl-1 pr-0.5',
                              isAgentActive
                                ? theme === 'dark'
                                  ? 'bg-zinc-800/80'
                                  : 'bg-zinc-100'
                                : '',
                            )}
                          >
                            <Link
                              href={detailPath}
                              onClick={(event) => {
                                if (navDisabled) {
                                  handleDisabledNavClick(event);
                                  return;
                                }
                                handleNavClick();
                              }}
                              aria-disabled={navDisabled}
                              tabIndex={navDisabled ? -1 : undefined}
                              title={agent.label}
                              className={cn(
                                'min-w-0 flex-1 truncate py-1.5 px-2 text-xs font-medium transition-colors',
                                navDisabledClass,
                                isAgentActive
                                  ? theme === 'dark'
                                    ? 'text-amber-400'
                                    : 'text-amber-700'
                                  : theme === 'dark'
                                    ? 'text-zinc-400 hover:text-zinc-100'
                                    : 'text-zinc-600 hover:text-zinc-900',
                              )}
                            >
                              {agent.label}
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    'shrink-0 rounded-lg p-1.5 transition-colors outline-none',
                                    theme === 'dark'
                                      ? 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200'
                                      : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800',
                                  )}
                                  aria-label={t.agentMenuAria}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className={cn(
                                  'min-w-[10rem]',
                                  theme === 'dark'
                                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                                    : 'bg-white border-zinc-200 text-zinc-900',
                                )}
                              >
                                <DropdownMenuItem onSelect={() => closeRecentAgent(agent.id)}>
                                  {t.closeSidebarAgent}
                                </DropdownMenuItem>
                                {isFavorite(agent.id) ? (
                                  <DropdownMenuItem onSelect={() => void removeFavorite(agent.id)}>
                                    {t.unfavoriteAgent}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onSelect={() => void addFavorite(agent.id, agent.label)}>
                                    {t.favoriteAgent}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  if (navDisabled) {
                    handleDisabledNavClick(event);
                    return;
                  }
                  handleNavClick();
                }}
                aria-disabled={navDisabled}
                tabIndex={navDisabled ? -1 : undefined}
                title={!showExpanded ? t[item.labelKey] : undefined}
                className={cn(
                  'flex items-center py-3 rounded-2xl text-sm font-medium transition-colors',
                  navRowLayout,
                  navDisabledClass,
                  isActive
                    ? theme === 'dark'
                      ? 'bg-zinc-800 text-amber-400'
                      : 'bg-zinc-100 text-amber-600'
                    : theme === 'dark'
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {showExpanded && <span>{t[item.labelKey]}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={cn(
          'border-t',
          showExpanded ? 'p-4' : 'p-2',
          theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200',
        )}
      >
        <button
          type="button"
          onClick={handleLogout}
          title={!showExpanded ? t.logout : undefined}
          className={cn(
            'flex w-full items-center py-3 text-sm font-medium transition-colors rounded-2xl',
            navRowLayout,
            theme === 'dark'
              ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50'
              : 'text-zinc-600 hover:text-red-500 hover:bg-zinc-100',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {showExpanded && <span>{t.logout}</span>}
        </button>
      </div>
    </aside>
  );
}
