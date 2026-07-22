'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocationUpdate } from '@/types/api.types';

export type GpsState =
  | 'idle'
  | 'loading'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'prompt';

const WATCH_OPTS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 300_000,
  timeout: 60_000,
};

const MOVE_THRESHOLD = 0.0003; // ~30m — ignore GPS jitter below this

function movedEnough(prev: LocationUpdate | null, next: LocationUpdate) {
  if (!prev) return true;
  return (
    Math.abs(prev.lat - next.lat) > MOVE_THRESHOLD ||
    Math.abs(prev.lng - next.lng) > MOVE_THRESHOLD
  );
}

function toLocation(pos: GeolocationPosition, vehicleId: string): LocationUpdate {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    speed: pos.coords.speed ?? 0,
    vehicleId,
  };
}

async function readPermission(): Promise<PermissionState | 'unsupported'> {
  if (!navigator.permissions?.query) return 'unsupported';
  try {
    const r = await navigator.permissions.query({ name: 'geolocation' });
    return r.state;
  } catch {
    return 'unsupported';
  }
}

export function useDriverGeolocation(
  vehicleId: string | undefined,
  enabled: boolean,
) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [permission, setPermission] = useState<PermissionState | 'unsupported'>(
    'unsupported',
  );
  const watchRef = useRef<number | null>(null);

  const stopWatch = useCallback(() => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    const vid = vehicleId;
    stopWatch();

    if (!vid) return;

    if (typeof window === 'undefined' || !window.isSecureContext) {
      setGpsState('unavailable');
      return;
    }

    if (!navigator.geolocation) {
      setGpsState('unavailable');
      return;
    }

    const perm = await readPermission();
    setPermission(perm);

    if (perm === 'denied') {
      setGpsState('denied');
      return;
    }

    setGpsState(perm === 'prompt' ? 'prompt' : 'loading');

    const onSuccess = (pos: GeolocationPosition) => {
      const next = toLocation(pos, vid);
      setGpsState('active');
      setPermission('granted');
      setLocation((prev) => (movedEnough(prev, next) ? next : prev));
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setGpsState('denied');
        setPermission('denied');
        return;
      }
      setGpsState('unavailable');
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 30_000,
      maximumAge: 300_000,
    });

    watchRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      WATCH_OPTS,
    );
  }, [vehicleId, stopWatch]);

  useEffect(() => {
    if (!enabled || !vehicleId) {
      stopWatch();
      return stopWatch;
    }

    readPermission().then((perm) => {
      setPermission(perm);
      if (perm === 'denied') {
        setGpsState('denied');
        return;
      }
      if (perm === 'granted') {
        void requestLocation();
        return;
      }
      setGpsState('prompt');
    });

    return stopWatch;
  }, [enabled, vehicleId, requestLocation, stopWatch]);

  return {
    location,
    gpsState,
    permission,
    requestLocation,
    isSecure: typeof window !== 'undefined' ? window.isSecureContext : true,
  };
}
