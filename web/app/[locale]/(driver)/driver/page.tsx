'use client';

import { useMe } from '@/hooks/use-auth';
import { useActiveTrip } from '@/hooks/use-tracking';
import { Loading } from '@/components/shared/states';
import { DriverActiveTrip } from '@/components/driver/driver-active-trip';
import { DriverInactiveTrip } from '@/components/driver/driver-inactive-trip';

export default function DriverTripPage() {
  const { data: user, isPending: userPending } = useMe();
  const { data: trip, isPending: tripPending } = useActiveTrip();

  const initialLoading =
    (userPending && user === undefined) || (tripPending && trip === undefined);

  if (initialLoading || !user) return <Loading />;

  return (
    <div className="space-y-4 lg:mx-auto lg:max-w-3xl">
      {trip ? (
        <DriverActiveTrip trip={trip} user={user} />
      ) : (
        <DriverInactiveTrip user={user} />
      )}
    </div>
  );
}
