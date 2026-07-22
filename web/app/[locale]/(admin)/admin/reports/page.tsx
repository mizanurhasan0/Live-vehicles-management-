'use client';

import { useTranslations } from 'next-intl';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useReports } from '@/hooks/use-tracking';
import { currentMonth, formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const t = useTranslations('nav');
  const ta = useTranslations('admin');
  const month = currentMonth();
  const { income, pending, usage, drivers } = useReports(month);
  if (income.isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('reports')} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>{ta('totalIncome')}</CardTitle>
          <p className="mt-2 text-xl font-bold">{formatCurrency((income.data as { total?: number })?.total ?? 0)}</p>
        </Card>
        <Card>
          <CardTitle>{ta('pendingPayments')}</CardTitle>
          <p className="mt-2 text-xl font-bold">{((pending.data as unknown[]) ?? []).length}</p>
        </Card>
      </div>
      <Card>
        <CardTitle>{ta('vehicleUsage')}</CardTitle>
        <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(usage.data, null, 2)}</pre>
      </Card>
      <Card>
        <CardTitle>Driver Activity</CardTitle>
        <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(drivers.data, null, 2)}</pre>
      </Card>
    </div>
  );
}
