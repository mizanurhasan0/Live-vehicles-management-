'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LiveMap } from '@/components/shared/live-map';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useLiveVehicles } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import type { LiveVehicle, LocationUpdate, MapMarkerInfo } from '@/types/api.types';

function resolveMarkerLocation(
  entry: LiveVehicle,
  live: Record<string, LocationUpdate>,
): LocationUpdate | null {
  return (
    live[entry.vehicle.id] ??
    entry.location ??
    null
  );
}

export default function AdminTrackingPage() {
  const t = useTranslations('admin');
  const nav = useTranslations('nav');
  const { data, isLoading } = useLiveVehicles();
  const [live, setLive] = useState<Record<string, LocationUpdate>>({});

  const onUpdate = useCallback((loc: LocationUpdate) => {
    setLive((prev) => ({ ...prev, [loc.vehicleId]: loc }));
  }, []);
  useTrackingSocket(onUpdate);

  const markers = useMemo((): MapMarkerInfo[] => {
    return (data ?? []).flatMap((entry) => {
      const location = resolveMarkerLocation(entry, live);
      if (!location) return [];

      const driver = entry.vehicle.driver;
      return [
        {
          location,
          driver: {
            name: driver?.user?.name ?? '',
            phone: driver?.user?.phone,
            photoUrl: driver?.user?.photoUrl,
            licenseNo: driver?.licenseNo,
          },
          vehicle: {
            number: entry.vehicle.number,
            routeName: entry.vehicle.route?.name,
          },
        },
      ];
    });
  }, [data, live]);

  const liveCount = markers.filter(
    (m) => m.location.source !== 'ROUTE_STOP',
  ).length;
  const totalVehicles = data?.length ?? 0;

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader title={nav('tracking')} />
      {totalVehicles === 0 ? (
        <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {t('trackingNoVehicles')}
        </p>
      ) : (
        <p className="text-sm text-zinc-600">
          {t('trackingSummary', { live: liveCount, total: totalVehicles })}
        </p>
      )}
      <LiveMap markers={markers} recenterMode="once" mapClassName="h-[min(70vh,640px)]" />
      {totalVehicles > 0 && liveCount === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('trackingOfflineHint')}
        </p>
      )}
    </div>
  );
}
