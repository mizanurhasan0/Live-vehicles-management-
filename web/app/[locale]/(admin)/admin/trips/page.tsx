'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useTrips } from '@/hooks/use-tracking';
import type { Trip } from '@/types/api.types';

export default function TripsPage() {
  const t = useTranslations('nav');
  const { data, isLoading } = useTrips();
  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('trips')} />
      <DataTable<Trip>
        columns={[
          { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle?.number ?? '-' },
          { key: 'driver', label: 'Driver', render: (r) => r.driver?.user?.name ?? '-' },
          { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
          { key: 'startedAt', label: 'Started', render: (r) => new Date(r.startedAt).toLocaleString() },
        ]}
        rows={data?.data ?? []}
      />
    </div>
  );
}
