// app/(dashboard)/dashboard/components/DashboardSidebar.tsx
// Sidebar con soporte completo para tema claro y oscuro

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Home, Users, BarChart3, Award, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from './LanguageContext';

const navItems = [
  { href: '/dashboard', labelKey: 'home' as const, icon: Home },
  { href: '/dashboard/agents', labelKey: 'agents' as const, icon: Users },
  { href: '/dashboard/humi', labelKey: 'humiIndex' as const, icon: BarChart3 },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const { t, theme } = useLanguage();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const certifications = [
    { href: '/dashboard/certificaciones/cerex', label: 'CEREX' },
    { href: '/dashboard/certificaciones/cerow', label: 'CEROW' },
  ];

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
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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

        {/* Certificaciones */}
        <div className="px-4 py-3">
          <button
            onClick={() => !isCollapsed && setIsCertOpen(!isCertOpen)}
            className={`flex w-full items-center gap-3 text-sm font-medium transition-colors ${
              theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Award className="w-5 h-5" />
            {!isCollapsed && (
              <>
                {t.certifications}
                <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${isCertOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {isCertOpen && !isCollapsed && (
            <div className="pl-8 mt-2 space-y-1">
              {certifications.map((cert) => {
                const isActive = pathname === cert.href;
                return (
                  <Link
                    key={cert.href}
                    href={cert.href}
                    className={`block px-4 py-2.5 rounded-xl text-sm transition-colors ${
                      isActive
                        ? theme === 'dark' ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-100 text-amber-600'
                        : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {cert.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

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