'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LiveMap } from '@/components/shared/live-map';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useLiveVehicles } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import type { LocationUpdate, MapMarkerInfo } from '@/types/api.types';

export default function AdminTrackingPage() {
  const t = useTranslations('nav');
  const { data, isLoading } = useLiveVehicles();
  const [live, setLive] = useState<Record<string, LocationUpdate>>({});

  const onUpdate = useCallback((loc: LocationUpdate) => {
    setLive((prev) => ({ ...prev, [loc.vehicleId]: loc }));
  }, []);
  useTrackingSocket(onUpdate);

  const markers = useMemo((): MapMarkerInfo[] => {
    const fromApi = (data ?? [])
      .filter((v) => v.location)
      .map((v) => v.location!);
    const merged = {
      ...Object.fromEntries(fromApi.map((l) => [l.vehicleId, l])),
      ...live,
    };
    const vehicleById = new Map((data ?? []).map((v) => [v.vehicle.id, v.vehicle]));

    return Object.values(merged).map((location) => {
      const vehicle = vehicleById.get(location.vehicleId);
      const driver = vehicle?.driver;
      return {
        location,
        driver: {
          name: driver?.user?.name ?? '',
          phone: driver?.user?.phone,
          photoUrl: driver?.user?.photoUrl,
          licenseNo: driver?.licenseNo,
        },
        vehicle: {
          number: vehicle?.number ?? location.vehicleId,
          routeName: vehicle?.route?.name,
        },
      };
    });
  }, [data, live]);

  if (isLoading) return <Loading />;
  return (
    <div>
      <PageHeader title={t('tracking')} />
      <LiveMap markers={markers} />
    </div>
  );
}
