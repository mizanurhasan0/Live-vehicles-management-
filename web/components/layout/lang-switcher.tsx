'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function LangSwitcher({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: 'bn' | 'en') => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className={cn(
        'flex gap-1 rounded-lg border p-1 text-xs',
        variant === 'dark'
          ? 'border-white/20 bg-white/10'
          : 'border-zinc-200 bg-white',
        className,
      )}
    >
      {(['bn', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={cn(
            'rounded px-2 py-1 uppercase',
            locale === l
              ? 'bg-emerald-600 text-white'
              : variant === 'dark'
                ? 'text-emerald-50 hover:bg-white/10'
                : 'text-zinc-600 hover:bg-zinc-50',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
