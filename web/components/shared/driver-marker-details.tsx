'use client';

import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/avatar';
import { resolveMediaUrl } from '@/lib/media-url';
import type { MapMarkerInfo } from '@/types/api.types';

export function DriverMarkerDetails({ marker }: { marker: MapMarkerInfo }) {
  const td = useTranslations('driver');
  const tm = useTranslations('map');
  const { driver, vehicle, location } = marker;

  if (!driver?.name && !vehicle?.number) {
    return (
      <p className="text-sm text-zinc-600">
        {tm('vehicleId', { id: location.vehicleId })}
      </p>
    );
  }

  const speedKmh =
    location.speed != null && location.speed > 0
      ? Math.round(location.speed * 3.6)
      : null;

  return (
    <div className="min-w-[180px] rounded-xl bg-white p-3 shadow-lg ring-1 ring-zinc-200">
      <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-2.5">
        <Avatar
          name={driver?.name ?? '?'}
          src={resolveMediaUrl(driver?.photoUrl)}
          size="sm"
          className="ring-1 ring-zinc-200 shadow-none"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {driver?.name ?? '—'}
          </p>
          <p className="text-xs text-zinc-500">{tm('driverDetails')}</p>
        </div>
      </div>
      <dl className="mt-2 space-y-1.5 text-xs">
        {driver?.phone && (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">{td('phone')}</dt>
            <dd className="font-medium text-zinc-800">{driver.phone}</dd>
          </div>
        )}
        {driver?.licenseNo && (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">{td('license')}</dt>
            <dd className="font-medium text-zinc-800">{driver.licenseNo}</dd>
          </div>
        )}
        {vehicle?.number && (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">{td('vehicle')}</dt>
            <dd className="font-medium text-zinc-800">{vehicle.number}</dd>
          </div>
        )}
        {vehicle?.routeName && (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">{tm('route')}</dt>
            <dd className="font-medium text-zinc-800">{vehicle.routeName}</dd>
          </div>
        )}
        {speedKmh != null && (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">{tm('speed')}</dt>
            <dd className="font-medium text-zinc-800">{speedKmh} km/h</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
