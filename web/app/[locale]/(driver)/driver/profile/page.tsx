'use client';

import { useTranslations } from 'next-intl';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useMe } from '@/hooks/use-auth';

export default function DriverProfilePage() {
  const t = useTranslations('nav');
  const { data: user, isLoading } = useMe();
  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('profile')} />
      <Card>
        <CardTitle>{user?.name}</CardTitle>
        <p className="mt-2 text-sm">Phone: {user?.phone}</p>
        <p className="text-sm">Role: {user?.role}</p>
      </Card>
    </div>
  );
}
