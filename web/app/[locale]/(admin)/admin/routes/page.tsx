'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Label } from '@/components/ui/input';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useRouteMutations, useRoutes } from '@/hooks/use-routes';
import type { Route } from '@/types/api.types';

export default function RoutesPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { data, isLoading } = useRoutes();
  const create = useRouteMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('routes')} action={<Button onClick={() => setOpen(true)}>{tc('create')}</Button>} />
      <DataTable<Route>
        columns={[
          { key: 'name', label: tc('name') },
          { key: 'stops', label: 'Stops', render: (r) => r.stops?.length ?? 0 },
        ]}
        rows={data?.data ?? []}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={t('routes')}>
        <div className="space-y-3">
          <div><Label>{tc('name')}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <Button onClick={() => create.mutate({
            name,
            stops: [{ name: 'Stop 1', lat: 23.81, lng: 90.41, order: 0 }],
          }, { onSuccess: () => setOpen(false) })}>{tc('save')}</Button>
        </div>
      </Modal>
    </div>
  );
}
