'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: 'bn' | 'en') => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 text-xs">
      {(['bn', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={`rounded px-2 py-1 uppercase ${locale === l ? 'bg-emerald-600 text-white' : 'text-zinc-600'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
