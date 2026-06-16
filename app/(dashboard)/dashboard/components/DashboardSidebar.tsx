// app/(dashboard)/dashboard/components/DashboardSidebar.tsx
// Sidebar con soporte completo para tema claro y oscuro

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LogOut,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { performDashboardLogout } from '@/lib/gsa/dashboard-logout';
import { useDashboardLogin } from './DashboardLoginContext';
import { useLanguage } from './LanguageContext';
import { useAgentRecentNavigation } from './AgentRecentNavigationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', labelKey: 'home' as const, icon: Home },
  { href: '/dashboard/agents', labelKey: 'agentsDirectory' as const, icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { t, theme } = useLanguage();
  const { recentAgents, favoriteAgents, closeRecentAgent, addFavorite, removeFavorite, isFavorite } =
    useAgentRecentNavigation();
  const { subscription } = useDashboardLogin();
  const navDisabled = subscription === 'Disable';
  const recentAgentsFiltered = recentAgents.filter((agent) => !isFavorite(agent.id));

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    void performDashboardLogout();
  };

  const navDisabledClass = navDisabled
    ? 'pointer-events-none opacity-50 cursor-not-allowed'
    : '';

  /** Rail colapsado (w-16): íconos centrados, sin padding horizontal agresivo */
  const navRowLayout = isCollapsed
    ? 'justify-center gap-0 px-2 min-h-[2.75rem]'
    : 'gap-3 px-4';

  return (
    <div className={`h-screen border-r flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${theme === 'dark' 
      ? 'bg-zinc-900 border-zinc-800' 
      : 'bg-white border-zinc-200 text-zinc-900'}`}
    >
      {/* Logo + Título */}
      <div
        className={`border-b flex items-center ${
          isCollapsed ? 'justify-center px-2 py-5' : 'gap-3 px-4 py-6'
        } ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}
      >
        <img
          src="/logo-gsa.png"
          alt="Global Score Agent"
          className={`transition-all object-contain object-center ${
            isCollapsed
              ? 'mx-auto h-10 max-h-10 w-auto max-w-[2.75rem]'
              : 'h-12 w-auto'
          }`}
        />
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-semibold tracking-tighter">Global Score</span>
            <span className="text-2xl font-semibold tracking-tighter -mt-1">Agent</span>
          </div>
        )}
      </div>

      {/* Botón colapsar */}
      <div className={`py-2 flex ${isCollapsed ? 'justify-center px-2' : 'justify-end px-4'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl transition-colors ${
            theme === 'dark' 
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-6 space-y-1">
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
                  aria-disabled={navDisabled}
                  title={isCollapsed ? t[item.labelKey] : undefined}
                  className={`flex items-center py-3 rounded-2xl text-sm font-medium transition-colors ${navRowLayout} ${navDisabledClass} ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-zinc-800 text-amber-400'
                        : 'bg-zinc-100 text-amber-600'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{t[item.labelKey]}</span>}
                </Link>
                {!isCollapsed && (recentAgentsFiltered.length > 0 || favoriteAgents.length > 0) && (
                  <div
                    className={`ml-2 pl-3 border-l ${
                      theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                    } space-y-0.5 pt-1 pb-1`}
                  >
                    {favoriteAgents.length > 0 && (
                      <>
                        <p
                          className={`px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                          }`}
                        >
                          {t.favoriteAgentsSubmenu}
                        </p>
                        {favoriteAgents.map((agent) => {
                          const detailPath = `/dashboard/agents/${agent.id}`;
                          const isAgentActive = pathname === detailPath;
                          return (
                            <div
                              key={`favorite-${agent.id}`}
                              className={`group flex items-center gap-0.5 rounded-xl pl-1 pr-0.5 ${
                                isAgentActive
                                  ? theme === 'dark'
                                    ? 'bg-zinc-800/80'
                                    : 'bg-zinc-100'
                                  : ''
                              }`}
                            >
                              <Link
                                href={detailPath}
                                aria-disabled={navDisabled}
                                title={agent.label}
                                className={`min-w-0 flex-1 truncate py-1.5 px-2 text-xs font-medium transition-colors ${navDisabledClass} ${
                                  isAgentActive
                                    ? theme === 'dark'
                                      ? 'text-amber-400'
                                      : 'text-amber-700'
                                    : theme === 'dark'
                                      ? 'text-zinc-300 hover:text-zinc-100'
                                      : 'text-zinc-700 hover:text-zinc-900'
                                }`}
                              >
                                {agent.label}
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className={`shrink-0 rounded-lg p-1.5 transition-colors outline-none ${
                                      theme === 'dark'
                                        ? 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
                                        : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'
                                    }`}
                                    aria-label={t.agentMenuAria}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className={`min-w-[10rem] ${
                                    theme === 'dark'
                                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                                      : 'bg-white border-zinc-200 text-zinc-900'
                                  }`}
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
                        className={`px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide ${
                          theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
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
                          className={`group flex items-center gap-0.5 rounded-xl pl-1 pr-0.5 ${
                            isAgentActive
                              ? theme === 'dark'
                                ? 'bg-zinc-800/80'
                                : 'bg-zinc-100'
                              : ''
                          }`}
                        >
                          <Link
                            href={detailPath}
                            aria-disabled={navDisabled}
                            title={agent.label}
                            className={`min-w-0 flex-1 truncate py-1.5 px-2 text-xs font-medium transition-colors ${navDisabledClass} ${
                              isAgentActive
                                ? theme === 'dark'
                                  ? 'text-amber-400'
                                  : 'text-amber-700'
                                : theme === 'dark'
                                  ? 'text-zinc-400 hover:text-zinc-100'
                                  : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            {agent.label}
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className={`shrink-0 rounded-lg p-1.5 transition-colors outline-none ${
                                  theme === 'dark'
                                    ? 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200'
                                    : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800'
                                }`}
                                aria-label={t.agentMenuAria}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className={`min-w-[10rem] ${
                                theme === 'dark'
                                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                                  : 'bg-white border-zinc-200 text-zinc-900'
                              }`}
                            >
                              <DropdownMenuItem
                                onSelect={() => closeRecentAgent(agent.id)}
                              >
                                {t.closeSidebarAgent}
                              </DropdownMenuItem>
                              {isFavorite(agent.id) ? (
                                <DropdownMenuItem
                                  onSelect={() => void removeFavorite(agent.id)}
                                >
                                  {t.unfavoriteAgent}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => void addFavorite(agent.id, agent.label)}
                                >
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
              aria-disabled={navDisabled}
              title={isCollapsed ? t[item.labelKey] : undefined}
              className={`flex items-center py-3 rounded-2xl text-sm font-medium transition-colors ${navRowLayout} ${navDisabledClass} ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'bg-zinc-100 text-amber-600'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{t[item.labelKey]}</span>}
            </Link>
          );
        })}
      </nav>
      </div>

      {/* Logout */}
      <div
        className={`border-t ${isCollapsed ? 'p-2' : 'p-4'} ${
          theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
        }`}
      >
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? t.logout : undefined}
          className={`flex w-full items-center py-3 text-sm font-medium transition-colors rounded-2xl ${navRowLayout} ${
            theme === 'dark'
              ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50'
              : 'text-zinc-600 hover:text-red-500 hover:bg-zinc-100'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{t.logout}</span>}
        </button>
      </div>
    </div>
  );
}