'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardTitle } from '@/components/ui/card';
import { LiveMap } from '@/components/shared/live-map';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useEta, useVehicleLive } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import { useStudents } from '@/hooks/use-students';
import type { LocationUpdate } from '@/types/api.types';

function TrackingContent() {
  const t = useTranslations('guardian');
  const params = useSearchParams();
  const vehicleId = params.get('vehicleId') ?? '';
  const studentId = params.get('studentId') ?? undefined;
  const { data, isLoading } = useVehicleLive(vehicleId || undefined);
  const { data: students } = useStudents();
  const student = useMemo(
    () => (students?.data ?? []).find((s) => s.id === studentId),
    [students, studentId],
  );

  const [live, setLive] = useState<LocationUpdate | null>(null);

  const onUpdate = useCallback(
    (loc: LocationUpdate) => {
      if (loc.vehicleId === vehicleId) setLive(loc);
    },
    [vehicleId],
  );
  useTrackingSocket(onUpdate);

  const location = live ?? data?.location ?? null;
  const locations = useMemo(() => (location ? [location] : []), [location]);
  const hasLiveGps = !!location;

  const fallbackCenter =
    student?.pickupLat != null && student?.pickupLng != null
      ? ([student.pickupLat, student.pickupLng] as [number, number])
      : undefined;

  const { data: eta } = useEta(vehicleId || undefined, studentId, hasLiveGps);

  if (!vehicleId) {
    return <p className="text-sm text-zinc-500">{t('selectChild')}</p>;
  }
  if (isLoading) return <Loading />;

  const vehicleNumber =
    (data?.vehicle as { number?: string } | undefined)?.number ?? vehicleId;

  return (
    <div>
      <PageHeader
        title={t('liveLocation')}
        subtitle={t('vehicleNumber', { number: vehicleNumber })}
      />
      {!hasLiveGps && fallbackCenter && (
        <p className="mb-3 text-sm text-amber-700">{t('gpsUnavailable')}</p>
      )}
      {!hasLiveGps && !fallbackCenter && (
        <p className="mb-3 text-sm text-zinc-500">{t('noLocationData')}</p>
      )}
      {eta && (
        <Card className="mb-4">
          <CardTitle>{t('eta')}</CardTitle>
          <p className="mt-1">
            {eta.durationText} · {eta.distanceText}
          </p>
        </Card>
      )}
      <LiveMap
        vehicleId={vehicleId}
        locations={locations}
        center={
          location
            ? [location.lat, location.lng]
            : fallbackCenter
        }
        fallbackCenter={fallbackCenter}
        fallbackLabel={student?.pickupPoint ?? t('pickupPoint')}
      />
    </div>
  );
}

export default function GuardianTrackingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrackingContent />
    </Suspense>
  );
}
