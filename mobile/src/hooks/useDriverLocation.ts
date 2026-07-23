import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { LocationUpdate } from '@/types/api.types';

export type GpsState = 'idle' | 'loading' | 'active' | 'denied' | 'unavailable';

const MOVE_THRESHOLD = 0.0003;

function movedEnough(prev: LocationUpdate | null, next: LocationUpdate) {
  if (!prev) return true;
  return (
    Math.abs(prev.lat - next.lat) > MOVE_THRESHOLD ||
    Math.abs(prev.lng - next.lng) > MOVE_THRESHOLD
  );
}

export function useDriverLocation(vehicleId: string | undefined, enabled: boolean) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const stop = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
  }, []);

  const requestLocation = useCallback(async () => {
    if (!vehicleId) return;
    stop();
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGpsState('denied');
      return;
    }
    setGpsState('loading');
    try {
      subRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 30, timeInterval: 8000 },
        (pos) => {
          const next: LocationUpdate = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed ?? 0,
            vehicleId,
          };
          setGpsState('active');
          setLocation((prev) => (movedEnough(prev, next) ? next : prev));
        },
      );
    } catch {
      setGpsState('unavailable');
    }
  }, [vehicleId, stop]);

  useEffect(() => {
    if (!enabled || !vehicleId) {
      stop();
      setGpsState('idle');
      return stop;
    }
    void requestLocation();
    return stop;
  }, [enabled, vehicleId, requestLocation, stop]);

  return { location, gpsState, requestLocation };
}
