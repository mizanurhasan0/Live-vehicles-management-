'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Label } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useGuardianMutations, useGuardians } from '@/hooks/use-guardians';
import type { Guardian } from '@/types/api.types';

export default function GuardiansPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { data, isLoading } = useGuardians();
  const create = useGuardianMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: 'password123' });

  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('guardians')} action={<Button onClick={() => setOpen(true)}>{tc('create')}</Button>} />
      <DataTable<Guardian>
        columns={[
          { key: 'name', label: tc('name'), render: (r) => r.user.name },
          { key: 'phone', label: tc('phone'), render: (r) => r.user.phone },
          { key: 'students', label: 'Students', render: (r) => r.students?.length ?? 0 },
        ]}
        rows={data?.data ?? []}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t('guardians')}>
        <div className="space-y-3">
          <div><Label>{tc('name')}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{tc('phone')}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <Button onClick={() => create.mutate(form, { onSuccess: () => setOpen(false) })}>{tc('save')}</Button>
        </div>
      </Modal>
    </div>
  );
}
