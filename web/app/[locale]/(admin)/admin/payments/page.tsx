'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { usePayments } from '@/hooks/use-tracking';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/types/api.types';

export default function PaymentsPage() {
  const t = useTranslations('nav');
  const { data, isLoading } = usePayments();
  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('payments')} />
      <DataTable<Payment>
        columns={[
          { key: 'student', label: 'Student', render: (r) => r.student?.name ?? '-' },
          { key: 'month', label: 'Month' },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
          { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
        ]}
        rows={data?.data ?? []}
      />
    </div>
  );
}
