'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Label } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useDriverMutations, useDrivers } from '@/hooks/use-drivers';
import type { Driver } from '@/types/api.types';

export default function DriversPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { data, isLoading } = useDrivers();
  const create = useDriverMutations().create;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: 'password123', licenseNo: '' });

  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('drivers')} action={<Button onClick={() => setOpen(true)}>{tc('create')}</Button>} />
      <DataTable<Driver>
        columns={[
          { key: 'name', label: tc('name'), render: (r) => r.user.name },
          { key: 'phone', label: tc('phone'), render: (r) => r.user.phone },
          { key: 'licenseNo', label: 'License' },
          { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle?.number ?? '-' },
        ]}
        rows={data?.data ?? []}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t('drivers')}>
        <div className="space-y-3">
          {(['name', 'phone', 'licenseNo'] as const).map((k) => (
            <div key={k}><Label>{k}</Label><Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
          ))}
          <Button onClick={() => create.mutate(form, { onSuccess: () => setOpen(false) })}>{tc('save')}</Button>
        </div>
      </Modal>
    </div>
  );
}
