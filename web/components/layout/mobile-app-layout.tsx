'use client';

import { useTranslations } from 'next-intl';
import { LangSwitcher } from './lang-switcher';
import { BottomNav, TopNav, type AppNavItem } from './bottom-nav';
import { UserMenu } from './user-menu';

export function MobileAppLayout({
  title,
  subtitle,
  nav,
  mobileNav,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: AppNavItem[];
  mobileNav?: AppNavItem[];
  children: React.ReactNode;
}) {
  const tApp = useTranslations('app');
  const bottomItems = mobileNav ?? nav;
  const showBottomNav = bottomItems.length > 1;

  return (
    <div className="min-h-screen bg-zinc-50 lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-emerald-50/80 lg:via-zinc-50 lg:to-white">
      {/* Mobile header */}
      <header className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 px-4 pb-6 pt-4 text-white shadow-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-emerald-100">{tApp('title')}</p>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-emerald-100">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-white/15 p-1 backdrop-blur-sm">
            <LangSwitcher variant="dark" />
          </div>
        </div>
      </header>

      {/* Desktop top navbar */}
      <header className="sticky top-0 z-50 hidden border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <div className="shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              {tApp('title')}
            </p>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">
              {title}
            </h1>
          </div>
          <div className="flex flex-1 justify-center">
            <TopNav items={nav} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <UserMenu />
            <LangSwitcher variant="light" />
          </div>
        </div>
      </header>

      {/* Body */}
      <main
        className={`mx-auto w-full max-w-lg px-4 pt-4 lg:max-w-7xl lg:px-6 lg:pt-6 ${
          showBottomNav ? 'pb-24 lg:pb-8' : 'pb-8'
        }`}
      >
        <div className="lg:rounded-2xl lg:border lg:border-zinc-200/60 lg:bg-white/90 lg:p-6 lg:shadow-sm lg:backdrop-blur-sm xl:p-8">
          {children}
        </div>
      </main>

      {showBottomNav && (
        <BottomNav items={bottomItems} className="lg:hidden" />
      )}
    </div>
  );
}
