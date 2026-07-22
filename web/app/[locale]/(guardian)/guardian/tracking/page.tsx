'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardTitle } from '@/components/ui/card';
import { LiveMap } from '@/components/shared/live-map';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useEta, useVehicleLive } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import type { LocationUpdate } from '@/types/api.types';

export default function GuardianTrackingPage() {
  const t = useTranslations('guardian');
  const params = useSearchParams();
  const vehicleId = params.get('vehicleId') ?? '';
  const studentId = params.get('studentId') ?? undefined;
  const { data, isLoading } = useVehicleLive(vehicleId || undefined);
  const { data: eta } = useEta(vehicleId || undefined, studentId);
  const [live, setLive] = useState<LocationUpdate | null>(null);

  const onUpdate = useCallback((loc: LocationUpdate) => {
    if (loc.vehicleId === vehicleId) setLive(loc);
  }, [vehicleId]);
  useTrackingSocket(onUpdate);

  const location = live ?? data?.location ?? null;
  const locations = useMemo(() => (location ? [location] : []), [location]);

  if (!vehicleId) return <p className="text-sm text-zinc-500">Select a child from home page.</p>;
  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title={t('liveLocation')} />
      {eta && (
        <Card className="mb-4">
          <CardTitle>{t('eta')}</CardTitle>
          <p className="mt-1">{eta.durationText} · {eta.distanceText}</p>
        </Card>
      )}
      <LiveMap locations={locations} center={location ? [location.lat, location.lng] : undefined} />
    </div>
  );
}
