'use client';

import { useTranslations } from 'next-intl';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { Link } from '@/i18n/navigation';
import { useStudents } from '@/hooks/use-students';
import { formatCurrency } from '@/lib/utils';

export default function GuardianHomePage() {
  const t = useTranslations('nav');
  const { data, isLoading } = useStudents();
  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title={t('children')} />
      <div className="grid gap-4 md:grid-cols-2">
        {(data?.data ?? []).map((s) => (
          <Card key={s.id}>
            <CardTitle>{s.name}</CardTitle>
            <p className="mt-1 text-sm text-zinc-600">Vehicle: {s.vehicle?.number ?? 'N/A'}</p>
            <p className="text-sm text-zinc-600">Fee: {formatCurrency(s.monthlyFee)}</p>
            {s.vehicleId && (
              <Link href={`/guardian/tracking?vehicleId=${s.vehicleId}&studentId=${s.id}`} className="mt-3 inline-block text-sm text-emerald-700">
                Live Tracking →
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
