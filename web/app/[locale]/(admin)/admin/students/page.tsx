'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Label } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useStudentMutations, useStudents } from '@/hooks/use-students';
import { formatCurrency } from '@/lib/utils';
import type { Student } from '@/types/api.types';

export default function StudentsPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { data, isLoading } = useStudents();
  const create = useStudentMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', guardianId: '', pickupPoint: '', dropPoint: '', monthlyFee: 1500,
  });

  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('students')} action={<Button onClick={() => setOpen(true)}>{tc('create')}</Button>} />
      <DataTable<Student>
        columns={[
          { key: 'name', label: tc('name') },
          { key: 'class', label: 'Class', render: (r) => r.class ?? '-' },
          { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle?.number ?? '-' },
          { key: 'monthlyFee', label: tc('amount'), render: (r) => formatCurrency(r.monthlyFee) },
        ]}
        rows={data?.data ?? []}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t('students')}>
        <div className="space-y-3">
          {(['name', 'guardianId', 'pickupPoint', 'dropPoint'] as const).map((k) => (
            <div key={k}><Label>{k}</Label><Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
          ))}
          <div><Label>{tc('amount')}</Label><Input type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: +e.target.value })} /></div>
          <Button onClick={() => create.mutate(form, { onSuccess: () => setOpen(false) })}>{tc('save')}</Button>
        </div>
      </Modal>
    </div>
  );
}
