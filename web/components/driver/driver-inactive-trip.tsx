'use client';

import { memo } from 'react';
import { Car, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useTripMutations } from '@/hooks/use-tracking';
import type { User } from '@/types/api.types';
import { toast } from 'sonner';

type VehicleInfo = {
  number: string;
  route?: { name: string };
};

export const DriverInactiveTrip = memo(function DriverInactiveTrip({
  user,
}: {
  user: User;
}) {
  const td = useTranslations('driver');
  const { start } = useTripMutations();
  const isSecure =
    typeof window !== 'undefined' ? window.isSecureContext : true;

  const vehicle = user.driver?.vehicle as VehicleInfo | undefined;

  return (
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
            {vehicle.route?.name && (
              <p className="text-xs text-zinc-500">{vehicle.route.name}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-zinc-500">{td('noVehicle')}</p>
      )}

      <Button
        className="mt-6 h-14 w-full text-base"
        onClick={() => {
          if (isSecure && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              () => {},
              () => {},
              { enableHighAccuracy: false, timeout: 10_000 },
            );
          }
          start.mutate(undefined, {
            onError: () => toast.error('Start failed'),
          });
        }}
        disabled={start.isPending}
      >
        {td('startTrip')}
      </Button>
    </div>
  );
});
