'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const MOVE_THRESHOLD = 0.0003; // ~30m — ignore GPS jitter below this

export function MapRecenter({
  center,
  zoom,
  mode = 'follow',
}: {
  center: [number, number];
  zoom?: number;
  mode?: 'once' | 'follow' | 'off';
}) {
  const map = useMap();
  const didOnce = useRef(false);
  const prev = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (mode === 'off') return;

    const [lat, lng] = center;

    if (mode === 'once') {
      if (didOnce.current) return;
      didOnce.current = true;
      map.setView(center, zoom ?? map.getZoom(), { animate: false });
      return;
    }

    const last = prev.current;
    if (last) {
      const dLat = Math.abs(last[0] - lat);
      const dLng = Math.abs(last[1] - lng);
      if (dLat < MOVE_THRESHOLD && dLng < MOVE_THRESHOLD) return;
    }
    prev.current = center;
    map.panTo(center, { animate: false });
  }, [center[0], center[1], map, zoom, mode]);

  return null;
}
