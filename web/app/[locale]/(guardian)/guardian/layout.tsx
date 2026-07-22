'use client';

import { Home, MapPin, User, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { RoleGuard } from '@/components/layout/role-guard';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('mobile');

  const nav = [
    {
      href: '/guardian',
      label: t('home'),
      icon: Home,
      match: (pathname: string) => pathname === '/guardian',
    },
    {
      href: '/guardian/tracking',
      label: t('track'),
      icon: MapPin,
    },
    {
      href: '/guardian/payments',
      label: t('pay'),
      icon: Wallet,
    },
    {
      href: '/guardian/profile',
      label: t('profile'),
      icon: User,
    },
  ];

  return (
    <RoleGuard role="GUARDIAN">
      <MobileAppLayout title={t('guardianTitle')} nav={nav}>
        {children}
      </MobileAppLayout>
    </RoleGuard>
  );
}
