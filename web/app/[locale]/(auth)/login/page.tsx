'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { LangSwitcher } from '@/components/layout/lang-switcher';
import { useLogin } from '@/hooks/use-auth';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tApp = useTranslations('app');
  const login = useLogin();
  const [phone, setPhone] = useState('01700000000');
  const [password, setPassword] = useState('password123');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-700">{tApp('title')}</h1>
            <p className="text-sm text-zinc-500">{tApp('subtitle')}</p>
          </div>
          <LangSwitcher />
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate({ phone, password });
          }}
        >
          <div>
            <Label>{t('phone')}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>{t('password')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {t('login')}
          </Button>
        </form>
      </div>
    </div>
  );
}
