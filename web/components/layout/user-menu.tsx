'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/avatar';
import { useLogout, useMe } from '@/hooks/use-auth';
import { resolveMediaUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const ta = useTranslations('auth');
  const { data: user } = useMe();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-3 transition hover:bg-zinc-100"
      >
        <Avatar
          name={user.name}
          src={resolveMediaUrl(user.photoUrl)}
          size="sm"
          className="ring-0 shadow-none"
        />
        <span className="max-w-32 truncate text-sm font-medium text-zinc-800">
          {user.name}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-zinc-500 transition',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout.mutate();
            }}
            disabled={logout.isPending}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {ta('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
