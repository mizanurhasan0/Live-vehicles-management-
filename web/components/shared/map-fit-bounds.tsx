'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function MapFitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current || points.length === 0) return;
    didFit.current = true;

    if (points.length === 1) {
      map.setView(points[0], 13, { animate: false });
      return;
    }

    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], animate: false });
  }, [map, points]);

  return null;
}
