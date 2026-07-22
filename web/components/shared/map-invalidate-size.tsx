'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/** Leaflet often mis-sizes maps inside flex/card layouts until invalidateSize runs. */
export function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(id);
  }, [map]);

  return null;
}
