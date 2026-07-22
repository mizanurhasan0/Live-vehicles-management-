'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LiveMap } from '@/components/shared/live-map';
import { useDriverGeolocation } from '@/hooks/use-driver-geolocation';
import { useTripMutations, useVehicleLive } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import type { LocationUpdate, MapMarkerInfo, Trip, User } from '@/types/api.types';

const ActiveTripBanner = memo(function ActiveTripBanner() {
  const td = useTranslations('driver');

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 text-center text-white">
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Radio className="h-10 w-10" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-100">{td('tripRunning')}</p>
      <h2 className="text-2xl font-bold">{td('activeTrip')}</h2>
    </div>
  );
});

const DriverTripMap = memo(function DriverTripMap({
  vehicleId,
  markers,
  center,
}: {
  vehicleId: string;
  markers: MapMarkerInfo[];
  center?: [number, number];
}) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-zinc-100">
      <LiveMap
        vehicleId={vehicleId}
        markers={markers}
        center={center}
        recenterMode="once"
        mapClassName="h-[280px] lg:h-[360px]"
      />
    </div>
  );
});

const LocationReadout = memo(function LocationReadout({
  location,
}: {
  location: LocationUpdate | null;
}) {
  const td = useTranslations('driver');

  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3">
      <p className="text-xs text-zinc-500">{td('currentLocation')}</p>
      <p className="font-mono text-sm font-medium text-zinc-900">
        {location
          ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
          : '—'}
      </p>
      {location?.speed != null && location.speed > 0 && (
        <p className="mt-0.5 text-xs text-zinc-500">
          {Math.round(location.speed * 3.6)} km/h
        </p>
      )}
    </div>
  );
});

export const DriverActiveTrip = memo(function DriverActiveTrip({
  trip,
  user,
}: {
  trip: Trip;
  user: User;
}) {
  const td = useTranslations('driver');
  const { end, postLocation } = useTripMutations();

  const vehicleId = trip.vehicle!.id;
  const vehicleNumber = trip.vehicle?.number ?? '—';

  const {
    location: gpsLocation,
    gpsState,
    requestLocation,
    isSecure,
  } = useDriverGeolocation(vehicleId, true);

  const [socketLocation, setSocketLocation] = useState<LocationUpdate | null>(null);

  const onSocketUpdate = useCallback(
    (loc: LocationUpdate) => {
      if (loc.vehicleId === vehicleId) {
        setSocketLocation(loc);
      }
    },
    [vehicleId],
  );
  useTrackingSocket(onSocketUpdate);

  const needsApiFallback = !gpsLocation && !socketLocation;
  const { data: liveData } = useVehicleLive(needsApiFallback ? vehicleId : undefined);

  const location = gpsLocation ?? socketLocation ?? liveData?.location ?? null;

  const lastPostRef = useRef(0);
  const postMutateRef = useRef(postLocation.mutate);
  useEffect(() => {
    postMutateRef.current = postLocation.mutate;
  }, [postLocation.mutate]);

  useEffect(() => {
    if (!gpsLocation) return;
    const now = Date.now();
    if (now - lastPostRef.current < 8_000) return;
    lastPostRef.current = now;
    postMutateRef.current({
      lat: gpsLocation.lat,
      lng: gpsLocation.lng,
      speed: gpsLocation.speed ?? 0,
    });
  }, [gpsLocation]);

  const mapMarkers = useMemo((): MapMarkerInfo[] => {
    if (!location) return [];
    return [
      {
        location,
        driver: {
          name: user.name,
          phone: user.phone,
          photoUrl: user.photoUrl,
          licenseNo: user.driver?.licenseNo,
        },
        vehicle: {
          number: vehicleNumber,
          routeName: user.driver?.vehicle?.route?.name,
        },
      },
    ];
  }, [location, user, vehicleNumber]);

  const mapCenter = useMemo(
    (): [number, number] | undefined =>
      location ? [location.lat, location.lng] : undefined,
    [location?.lat, location?.lng],
  );

  const isDesktop = useMemo(
    () =>
      typeof window !== 'undefined' &&
      !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
    [],
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
      <ActiveTripBanner />
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs text-zinc-500">{td('vehicle')}</p>
            <p className="font-semibold text-zinc-900">{vehicleNumber}</p>
          </div>
        </div>
        {!isSecure && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {td('gpsInsecure')}
          </p>
        )}
        {gpsState === 'loading' && !location && (
          <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            {td('gpsLoading')}
          </p>
        )}
        {gpsState === 'prompt' && !location && (
          <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {td('gpsPrompt')}
          </p>
        )}
        {gpsState === 'denied' && (
          <>
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {td('gpsDenied')}
            </p>
            <p className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
              {td('gpsChromeHint')}
            </p>
          </>
        )}
        {gpsState === 'unavailable' && !location && (
          <>
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {td('gpsUnavailable')}
            </p>
            <p className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
              {td('gpsChromeHint')}
            </p>
            {isDesktop && (
              <p className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-900">
                {td('gpsDesktopHint')}
              </p>
            )}
          </>
        )}

        {!location && isSecure && gpsState !== 'denied' && (
          <Button type="button" className="h-12 w-full" onClick={requestLocation}>
            {td('enableGps')}
          </Button>
        )}

        <DriverTripMap
          vehicleId={vehicleId}
          markers={mapMarkers}
          center={mapCenter}
        />

        <LocationReadout location={location} />

        {location && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {td('gpsActive')}
          </div>
        )}

        <Button
          variant="danger"
          className="h-14 w-full text-base"
          onClick={() => end.mutate(trip.id)}
          disabled={end.isPending}
        >
          {td('endTrip')}
        </Button>
      </div>
    </div>
  );
});
