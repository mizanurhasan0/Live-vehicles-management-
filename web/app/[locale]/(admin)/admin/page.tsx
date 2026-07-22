'use client';

import { useTranslations } from 'next-intl';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useReports } from '@/hooks/use-tracking';
import { currentMonth, formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const month = currentMonth();
  const { income, pending, usage } = useReports(month);

  if (income.isLoading) return <Loading />;

  const incomeData = income.data as { total?: number; count?: number };
  const pendingData = pending.data as unknown[];
  const usageData = usage.data as unknown[];

  return (
    <div>
      <PageHeader title={t('totalIncome')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>{t('totalIncome')}</CardTitle>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {formatCurrency(incomeData?.total ?? 0)}
          </p>
          <p className="text-xs text-zinc-500">{month}</p>
        </Card>
        <Card>
          <CardTitle>{t('pendingPayments')}</CardTitle>
          <p className="mt-2 text-2xl font-bold">{pendingData?.length ?? 0}</p>
        </Card>
        <Card>
          <CardTitle>{t('vehicleUsage')}</CardTitle>
          <p className="mt-2 text-2xl font-bold">{usageData?.length ?? 0}</p>
        </Card>
      </div>
    </div>
  );
}
