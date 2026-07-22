'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LangSwitcher } from './lang-switcher';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';

type NavItem = { href: string; labelKey: string };

export function PanelLayout({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      <aside className="w-full border-b border-zinc-200 bg-white lg:fixed lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-4 lg:block">
          <div>
            <p className="text-lg font-bold text-emerald-700">{title}</p>
            <p className="text-xs text-zinc-500">Madrasa Transport</p>
          </div>
          <div className="lg:mt-4">
            <LangSwitcher />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:block lg:space-y-1 lg:p-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block whitespace-nowrap rounded-lg px-3 py-2 text-sm',
                pathname === item.href
                  ? 'bg-emerald-50 font-medium text-emerald-700'
                  : 'text-zinc-600 hover:bg-zinc-100',
              )}
            >
              {t(item.labelKey as 'dashboard')}
            </Link>
          ))}
        </nav>
        <div className="hidden p-4 lg:block">
          <Button variant="secondary" className="w-full" onClick={() => logout.mutate()}>
            {tAuth('logout')}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-4 lg:ml-64 lg:p-8">{children}</main>
    </div>
  );
}
