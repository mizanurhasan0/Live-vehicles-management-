'use client';

import { LogOut, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/shared/states';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLogout, useMe } from '@/hooks/use-auth';

export default function GuardianProfilePage() {
  const t = useTranslations('mobile');
  const ta = useTranslations('auth');
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 lg:mx-auto lg:max-w-xl">
      <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-8 shadow-sm ring-1 ring-zinc-100">
        <Avatar
          name={user?.name ?? '?'}
          src={resolveMediaUrl(user?.photoUrl)}
          size="lg"
        />
        <h2 className="mt-4 text-xl font-bold text-zinc-900">{user?.name}</h2>
        <p className="text-sm text-zinc-500">{t('guardianRole')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5">
          <Phone className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-xs text-zinc-500">{ta('phone')}</p>
            <p className="font-medium text-zinc-900">{user?.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <User className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-xs text-zinc-500">{t('accountId')}</p>
            <p className="truncate text-sm font-medium text-zinc-700">
              {user?.id}
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="danger"
        className="h-12 w-full gap-2 text-base lg:hidden"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut className="h-5 w-5" />
        {ta('logout')}
      </Button>
    </div>
  );
}
