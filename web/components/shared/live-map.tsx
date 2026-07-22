'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { LocationUpdate } from '@/types/api.types';

const MapInner = dynamic(() => import('./live-map-inner'), { ssr: false });

export function LiveMap({
  locations,
  center,
  fallbackCenter,
  fallbackLabel,
  vehicleId,
}: {
  locations: LocationUpdate[];
  center?: [number, number];
  fallbackCenter?: [number, number];
  fallbackLabel?: string;
  vehicleId?: string;
}) {
  const c =
    center ??
    (locations[0]
      ? ([locations[0].lat, locations[0].lng] as [number, number])
      : fallbackCenter ?? ([23.8103, 90.4125] as [number, number]));

  return (
    <MapInner
      key={vehicleId ?? locations[0]?.vehicleId ?? 'map'}
      locations={locations}
      center={c}
      fallbackCenter={fallbackCenter}
      fallbackLabel={fallbackLabel}
    />
  );
}
