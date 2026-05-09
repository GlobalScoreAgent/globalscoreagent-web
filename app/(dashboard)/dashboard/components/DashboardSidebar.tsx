// app/(dashboard)/dashboard/components/DashboardSidebar.tsx
// Sidebar con soporte completo para tema claro y oscuro

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LogOut,
  Home,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Package,
  MoreHorizontal,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from './LanguageContext';
import RoadMapCards from './RoadMapCards';
import { useAgentRecentNavigation } from './AgentRecentNavigationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROADMAP_EXPANDED_KEY = 'gsa:roadmapExpanded';

const navItems = [
  { href: '/dashboard', labelKey: 'home' as const, icon: Home },
  { href: '/dashboard/agents', labelKey: 'agentsDirectory' as const, icon: Users },
  { href: '/dashboard/humi', labelKey: 'humiIndex' as const, icon: BarChart3 },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const { t, theme } = useLanguage();
  const { recentAgents, closeRecentAgent, addFavorite, removeFavorite, isFavorite } =
    useAgentRecentNavigation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [roadMapBodyOpen, setRoadMapBodyOpen] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(ROADMAP_EXPANDED_KEY);
      if (v === '0') setRoadMapBodyOpen(false);
      if (v === '1') setRoadMapBodyOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleRoadMapBody = () => {
    setRoadMapBodyOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ROADMAP_EXPANDED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

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
                  title={isCollapsed ? t[item.labelKey] : undefined}
                  className={`flex items-center py-3 rounded-2xl text-sm font-medium transition-colors ${navRowLayout} ${
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
                {!isCollapsed && recentAgents.length > 0 && (
                  <div
                    className={`ml-2 pl-3 border-l ${
                      theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                    } space-y-0.5 pt-1 pb-1`}
                  >
                    <p
                      className={`px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                      }`}
                    >
                      {t.recentAgentsSubmenu}
                    </p>
                    {recentAgents.map((agent) => {
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
                            title={agent.label}
                            className={`min-w-0 flex-1 truncate py-1.5 px-2 text-xs font-medium transition-colors ${
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
                            <DropdownMenuContent align="end" className="min-w-[10rem]">
                              <DropdownMenuItem
                                onSelect={() => closeRecentAgent(agent.id)}
                              >
                                {t.closeSidebarAgent}
                              </DropdownMenuItem>
                              {isFavorite(agent.id) ? (
                                <DropdownMenuItem
                                  onSelect={() => removeFavorite(agent.id)}
                                >
                                  {t.unfavoriteAgent}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => addFavorite(agent.id)}
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
              title={isCollapsed ? t[item.labelKey] : undefined}
              className={`flex items-center py-3 rounded-2xl text-sm font-medium transition-colors ${navRowLayout} ${
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

      {/* Road Map */}
      {!isCollapsed && (
        <div
          className={`mx-3 mb-4 mt-auto shrink-0 overflow-hidden rounded-2xl border ${
            theme === 'dark'
              ? 'border-zinc-700/50 bg-zinc-800/50'
              : 'border-zinc-200 bg-zinc-50'
          }`}
        >
          <button
            type="button"
            onClick={toggleRoadMapBody}
            className={`flex w-full items-start justify-between gap-2 p-4 text-left transition-colors ${
              theme === 'dark' ? 'hover:bg-zinc-800/80' : 'hover:bg-zinc-100/80'
            }`}
            aria-expanded={roadMapBodyOpen}
            aria-label={roadMapBodyOpen ? t.roadMapCollapseAria : t.roadMapExpandAria}
          >
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span className="flex min-w-0 flex-col leading-snug">
                <span
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                  }`}
                >
                  {t.roadMapLine1}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                  }`}
                >
                  {t.roadMapLine2}
                </span>
              </span>
            </div>
            {roadMapBodyOpen ? (
              <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            ) : (
              <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            )}
          </button>
          {roadMapBodyOpen ? (
            <div className="max-h-52 overflow-y-auto px-4 pb-4">
              <RoadMapCards />
            </div>
          ) : null}
        </div>
      )}
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