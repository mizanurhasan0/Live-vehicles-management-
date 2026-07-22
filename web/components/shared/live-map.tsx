'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { LocationUpdate, MapMarkerInfo } from '@/types/api.types';

const MapInner = dynamic(() => import('./live-map-inner'), { ssr: false });

function toMarkers(
  markers?: MapMarkerInfo[],
  locations?: LocationUpdate[],
): MapMarkerInfo[] {
  if (markers?.length) return markers;
  return (locations ?? []).map((location) => ({ location }));
}

export function LiveMap({
  markers,
  locations,
  center,
  fallbackCenter,
  fallbackLabel,
  vehicleId,
  mapClassName,
  recenterMode = 'follow',
}: {
  markers?: MapMarkerInfo[];
  locations?: LocationUpdate[];
  center?: [number, number];
  fallbackCenter?: [number, number];
  fallbackLabel?: string;
  vehicleId?: string;
  mapClassName?: string;
  recenterMode?: 'once' | 'follow' | 'off';
}) {
  const resolved = toMarkers(markers, locations);
  const first = resolved[0]?.location;

  const c =
    center ??
    (first
      ? ([first.lat, first.lng] as [number, number])
      : fallbackCenter ?? ([23.8103, 90.4125] as [number, number]));

  return (
    <MapInner
      key={vehicleId ?? first?.vehicleId ?? 'map'}
      markers={resolved}
      center={c}
      fallbackCenter={fallbackCenter}
      fallbackLabel={fallbackLabel}
      mapClassName={mapClassName}
      recenterMode={recenterMode}
    />
  );
}
