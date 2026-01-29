'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, Settings, Building2, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OrgSwitcher } from './org-switcher';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/hooks/use-auth';

const navigationItems = [
  { key: 'apps', href: '/apps', icon: LayoutGrid },
  { key: 'team', href: '/members', icon: Users },
  { key: 'organization', href: '/organization/settings', icon: Building2 },
  { key: 'settings', href: '/settings', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/apps" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            C
          </div>
          <span className="font-semibold">Ceed Publisher</span>
        </Link>
      </div>

      <div className="border-b px-2 py-3">
        <OrgSwitcher />
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            {tCommon('signOut')}
          </button>
        </div>
      </div>
    </aside>
  );
}
