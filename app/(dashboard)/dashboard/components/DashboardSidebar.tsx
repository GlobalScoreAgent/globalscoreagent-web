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

  return (
    <div className={`h-screen border-r flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${theme === 'dark' 
      ? 'bg-zinc-900 border-zinc-800' 
      : 'bg-white border-zinc-200 text-zinc-900'}`}
    >
      {/* Logo + Título */}
      <div className={`px-4 py-6 border-b flex items-center gap-3 ${
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
        <img 
          src="/logo-gsa.png" 
          alt="Global Score Agent" 
          className={`transition-all ${isCollapsed ? 'h-10 w-10' : 'h-12 w-auto'}`}
        />
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-semibold tracking-tighter">Global Score</span>
            <span className="text-2xl font-semibold tracking-tighter -mt-1">Agent</span>
          </div>
        )}
      </div>

      {/* Botón colapsar */}
      <div className="px-4 py-2 flex justify-end">
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto min-h-0">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-zinc-800 text-amber-400'
                        : 'bg-zinc-100 text-amber-600'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
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
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'bg-zinc-100 text-amber-600'
                  : theme === 'dark'
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span>{t[item.labelKey]}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Road Map */}
      {!isCollapsed && (
        <div
          className={`mx-3 mb-4 flex flex-1 flex-col overflow-hidden rounded-2xl border ${
            theme === 'dark'
              ? 'border-zinc-700/50 bg-zinc-800/50'
              : 'border-zinc-200 bg-zinc-50'
          }`}
        >
          <button
            type="button"
            onClick={toggleRoadMapBody}
            className={`flex w-full items-center justify-between gap-2 p-4 text-left transition-colors ${
              theme === 'dark' ? 'hover:bg-zinc-800/80' : 'hover:bg-zinc-100/80'
            }`}
            aria-expanded={roadMapBodyOpen}
            aria-label={roadMapBodyOpen ? t.roadMapCollapseAria : t.roadMapExpandAria}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-amber-500" />
              <span
                className={`truncate text-sm font-semibold ${
                  theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                }`}
              >
                {t.roadMap}
              </span>
            </div>
            {roadMapBodyOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            )}
          </button>
          {roadMapBodyOpen ? (
            <div className="px-4 pb-4">
              <RoadMapCards />
            </div>
          ) : null}
        </div>
      )}

      {/* Logout */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors w-full rounded-2xl ${
            theme === 'dark'
              ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50'
              : 'text-zinc-600 hover:text-red-500 hover:bg-zinc-100'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>{t.logout}</span>}
        </button>
      </div>
    </div>
  );
}