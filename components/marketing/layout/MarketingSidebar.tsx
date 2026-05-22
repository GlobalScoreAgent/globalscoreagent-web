'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  AlertCircle,
  Target,
  Package,
  BarChart3,
  Wallet,
  Cog,
  Scale,
  CreditCard,
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';

type NavItem = {
  href: string;
  labelKey: keyof typeof marketingCopy.nav;
  icon: typeof Home;
  external?: boolean;
};

const navItems: NavItem[] = [
  { href: '/#overview', labelKey: 'home', icon: Home },
  { href: '/#problem', labelKey: 'problem', icon: AlertCircle },
  { href: '/#mission', labelKey: 'mission', icon: Target },
  { href: '/#products', labelKey: 'products', icon: Package },
  { href: '/humi', labelKey: 'humi', icon: BarChart3, external: true },
  { href: '/wami', labelKey: 'wami', icon: Wallet, external: true },
  { href: '/#subscriptions', labelKey: 'subscriptions', icon: CreditCard },
  { href: '/#how-we-work', labelKey: 'howWeWork', icon: Cog },
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
    'flex items-center justify-center rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-gold md:group-hover:justify-start md:group-hover:gap-3';

  const labelClass =
    'max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 md:group-hover:max-w-[12rem] md:group-hover:opacity-100';

  return (
    <aside className="group fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-zinc-800/50 bg-zinc-950/35 backdrop-blur-md transition-[width,background-color,backdrop-filter] duration-300 md:hover:w-64 md:hover:bg-zinc-950/55 md:hover:backdrop-blur-xl">
      <div className="flex items-center justify-center border-b border-zinc-800/50 p-4 md:justify-start md:group-hover:gap-3">
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
