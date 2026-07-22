'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LiveMap } from '@/components/shared/live-map';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useLiveVehicles } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import type { LocationUpdate } from '@/types/api.types';

export default function AdminTrackingPage() {
  const t = useTranslations('nav');
  const { data, isLoading } = useLiveVehicles();
  const [live, setLive] = useState<Record<string, LocationUpdate>>({});

  const onUpdate = useCallback((loc: LocationUpdate) => {
    setLive((prev) => ({ ...prev, [loc.vehicleId]: loc }));
  }, []);
  useTrackingSocket(onUpdate);

  const locations = useMemo(() => {
    const fromApi = (data ?? [])
      .filter((v) => v.location)
      .map((v) => v.location!);
    const merged = { ...Object.fromEntries(fromApi.map((l) => [l.vehicleId, l])), ...live };
    return Object.values(merged);
  }, [data, live]);

  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('tracking')} />
      <LiveMap locations={locations} />
    </div>
  );
}
