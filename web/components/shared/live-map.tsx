'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import type { LocationUpdate } from '@/types/api.types';

const MapInner = dynamic(() => import('./live-map-inner'), { ssr: false });

export function LiveMap({
  locations,
  center,
}: {
  locations: LocationUpdate[];
  center?: [number, number];
}) {
  useEffect(() => {
    import('leaflet/dist/leaflet.css');
  }, []);
  const c = center ?? (locations[0] ? [locations[0].lat, locations[0].lng] as [number, number] : [23.8103, 90.4125]);
  return <MapInner locations={locations} center={c} />;
}
