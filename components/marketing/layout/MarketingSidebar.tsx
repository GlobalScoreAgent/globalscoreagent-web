'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Shield,
  AlertCircle,
  Target,
  Package,
  BarChart3,
  Wallet,
  Cog,
  Scale,
  CreditCard,
  BookOpen,
  Code2,
  Trophy,
  Map,
  BadgeCheck,
  Newspaper,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { insightsAppPath } from '@/lib/insights/site';

type NavItem = {
  href: string;
  labelKey: keyof typeof marketingCopy.nav;
  icon: typeof Home;
  external?: boolean;
};

const navItems: NavItem[] = [
  { href: '/#overview', labelKey: 'home', icon: Home },
  { href: '/#erc-8004', labelKey: 'erc8004', icon: Shield },
  { href: '/#problem', labelKey: 'problem', icon: AlertCircle },
  { href: '/#mission', labelKey: 'mission', icon: Target },
  { href: '/#products', labelKey: 'products', icon: Package },
  { href: '/humi', labelKey: 'humi', icon: BarChart3, external: true },
  { href: '/wami', labelKey: 'wami', icon: Wallet, external: true },
  { href: '/walcert', labelKey: 'walcert', icon: BadgeCheck, external: true },
  { href: insightsAppPath(), labelKey: 'insights', icon: Newspaper, external: true },
  { href: '/top-10-agents', labelKey: 'top10Agents', icon: Trophy, external: true },
  { href: '/pricing', labelKey: 'pricing', icon: CreditCard, external: true },
  { href: '/public-api', labelKey: 'publicApi', icon: Code2, external: true },
  { href: '/docs/global-score-agent', labelKey: 'documentation', icon: BookOpen, external: true },
  { href: '/#roadmap', labelKey: 'roadmap', icon: Map },
  { href: '/#how-we-work', labelKey: 'howWeWork', icon: Cog },
  { href: '/about', labelKey: 'about', icon: Users, external: true },
  { href: '/legal', labelKey: 'legal', icon: Scale, external: true },
];

export default function MarketingSidebar() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const handleNavClick = (href: string, external?: boolean) => {
    if (external || !href.startsWith('/#')) return;
    if (!isHome) return;
    const id = href.replace('/#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const linkClass =
    'flex items-center justify-center rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-gold md:justify-start md:gap-3';

  const labelClass =
    'max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 md:max-w-[12rem] md:opacity-100';

  return (
    <aside className="group fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-zinc-800/50 bg-zinc-950/35 backdrop-blur-md transition-[background-color,backdrop-filter] duration-300 md:w-64 md:bg-zinc-950/55 md:backdrop-blur-xl">
      <div className="flex items-center justify-center border-b border-zinc-800/50 p-4 md:justify-start md:gap-3">
        <img
          src="/logo-gsa.png"
          alt="Global Score Agent"
          className="h-10 w-10 shrink-0 object-contain"
        />
        <div className={labelClass}>
          <p className="truncate text-sm font-semibold text-white">Global Score Agent</p>
          <p className="truncate text-xs text-zinc-500">
            {language === 'es' ? 'Reputación ERC-8004' : 'ERC-8004 Reputation'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = pick(language, marketingCopy.nav[item.labelKey]);

          if (item.external) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass}
                title={label}
              >
                <Icon size={20} className="shrink-0" />
                <span className={labelClass}>{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (isHome && item.href.startsWith('/#')) {
                  e.preventDefault();
                  handleNavClick(item.href);
                }
              }}
              className={linkClass}
              title={label}
            >
              <Icon size={20} className="shrink-0" />
              <span className={labelClass}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
