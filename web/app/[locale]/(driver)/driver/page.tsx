'use client';

import { useEffect, useState } from 'react';
import { Car, MapPin, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LiveMap } from '@/components/shared/live-map';
import { Loading } from '@/components/shared/states';
import { useMe } from '@/hooks/use-auth';
import { useActiveTrip, useTripMutations } from '@/hooks/use-tracking';
import type { LocationUpdate } from '@/types/api.types';
import { toast } from 'sonner';

export default function DriverTripPage() {
  const td = useTranslations('driver');
  const { data: user } = useMe();
  const { data: trip, isLoading } = useActiveTrip();
  const { start, end, postLocation } = useTripMutations();
  const [location, setLocation] = useState<LocationUpdate | null>(null);

  const vehicle = trip?.vehicle ?? user?.driver?.vehicle;

  useEffect(() => {
    if (!trip?.id || !trip.vehicle?.id) {
      setLocation(null);
      return;
    }
    if (!navigator.geolocation) return;

    const update = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc: LocationUpdate = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed ?? 0,
          vehicleId: trip.vehicle!.id,
        };
        setLocation(loc);
        postLocation.mutate({
          lat: loc.lat,
          lng: loc.lng,
          speed: loc.speed ?? 0,
        });
      });
    };

    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, [trip?.id, trip?.vehicle?.id, postLocation]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4 lg:mx-auto lg:max-w-3xl">
      {!trip ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-100">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <Car className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-zinc-900">{td('noTrip')}</h2>
          <p className="mt-2 text-sm text-zinc-600">{td('startTripHint')}</p>

          {vehicle ? (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-left">
              <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs text-zinc-500">{td('assignedVehicle')}</p>
                <p className="font-semibold text-zinc-900">{vehicle.number}</p>
                {'route' in vehicle && vehicle.route?.name && (
                  <p className="text-xs text-zinc-500">{vehicle.route.name}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-zinc-500">{td('noVehicle')}</p>
          )}

          <Button
            className="mt-6 h-14 w-full text-base"
            onClick={() =>
              start.mutate(undefined, {
                onError: () => toast.error('Start failed'),
              })
            }
            disabled={start.isPending}
          >
            {td('startTrip')}
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 text-center text-white">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Radio className="h-10 w-10" />
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-emerald-100">
              {td('tripRunning')}
            </p>
            <h2 className="text-2xl font-bold">{td('activeTrip')}</h2>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs text-zinc-500">{td('vehicle')}</p>
                <p className="font-semibold text-zinc-900">
                  {trip.vehicle?.number ?? '—'}
                </p>
              </div>
            </div>

            {location && (
              <>
                <LiveMap
                  locations={[location]}
                  vehicleId={location.vehicleId}
                  mapClassName="h-[280px] lg:h-[360px]"
                />
                <div className="rounded-xl bg-zinc-50 px-4 py-3">
                  <p className="text-xs text-zinc-500">{td('currentLocation')}</p>
                  <p className="font-mono text-sm font-medium text-zinc-900">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                  {location.speed != null && location.speed > 0 && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {Math.round(location.speed * 3.6)} km/h
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {td('gpsActive')}
            </div>
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
      )}
    </div>
  );
}
