'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

function useNavActive(items: AppNavItem[]) {
  const pathname = usePathname();
  return (item: AppNavItem) =>
    item.match
      ? item.match(pathname)
      : pathname === item.href ||
        (item.href !== '/' && pathname.startsWith(item.href));
}

export function BottomNav({
  items,
  className,
}: {
  items: AppNavItem[];
  className?: string;
}) {
  const isActive = useNavActive(items);

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-medium transition',
                active
                  ? 'text-emerald-700'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <Icon
                className={cn('h-5 w-5', active && 'stroke-[2.5px]')}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopNav({ items }: { items: AppNavItem[] }) {
  const isActive = useNavActive(items);

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
              active
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
