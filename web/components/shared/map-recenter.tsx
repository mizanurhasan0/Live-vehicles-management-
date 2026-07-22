'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapRecenter({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [center[0], center[1], map, zoom]);

  return null;
}
