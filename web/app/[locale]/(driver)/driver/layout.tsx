'use client';

import { Car, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { RoleGuard } from '@/components/layout/role-guard';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('mobile');

  const nav = [
    {
      href: '/driver',
      label: t('trip'),
      icon: Car,
      match: (pathname: string) => pathname === '/driver',
    },
    {
      href: '/driver/profile',
      label: t('profile'),
      icon: User,
    },
  ];

  return (
    <RoleGuard role="DRIVER">
      <MobileAppLayout title={t('driverTitle')} nav={nav}>
        {children}
      </MobileAppLayout>
    </RoleGuard>
  );
}
