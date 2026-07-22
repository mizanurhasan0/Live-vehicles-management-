'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Label } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState, Loading } from '@/components/shared/states';
import { useVehicleMutations, useVehicles } from '@/hooks/use-vehicles';
import type { Vehicle } from '@/types/api.types';

export default function VehiclesPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { data, isLoading } = useVehicles();
  const { create, remove } = useVehicleMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: '', capacity: 30 });

  if (isLoading) return <Loading label={tc('loading')} />;
  const rows = data?.data ?? [];
  if (!rows.length && !open) return (
    <>
      <PageHeader title={t('vehicles')} action={<Button onClick={() => setOpen(true)}>{tc('create')}</Button>} />
      <EmptyState message={tc('empty')} />
      <Modal open={open} onClose={() => setOpen(false)} title={t('vehicles')}>
        <Form form={form} setForm={setForm} onSubmit={() => { create.mutate(form, { onSuccess: () => setOpen(false) }); }} tc={tc} />
      </Modal>
    </>
  );

  return (
    <div>
      <PageHeader title={t('vehicles')} action={<Button onClick={() => setOpen(true)}>{tc('create')}</Button>} />
      <DataTable<Vehicle>
        columns={[
          { key: 'number', label: 'Number' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'status', label: tc('status'), render: (r) => <Badge status={r.status} /> },
          { key: 'driver', label: 'Driver', render: (r) => r.driver?.user?.name ?? '-' },
        ]}
        rows={rows}
        actions={(r) => <Button size="sm" variant="danger" onClick={() => remove.mutate(r.id)}>{tc('delete')}</Button>}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t('vehicles')}>
        <Form form={form} setForm={setForm} onSubmit={() => { create.mutate(form, { onSuccess: () => setOpen(false) }); }} tc={tc} />
      </Modal>
    </div>
  );
}

function Form({ form, setForm, onSubmit, tc }: { form: { number: string; capacity: number }; setForm: (f: typeof form) => void; onSubmit: () => void; tc: (k: string) => string }) {
  return (
    <div className="space-y-3">
      <div><Label>Number</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
      <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
      <Button onClick={onSubmit}>{tc('save')}</Button>
    </div>
  );
}
