'use client';

import { useMe } from '@/hooks/use-auth';
import { useActiveTrip } from '@/hooks/use-tracking';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Loading } from '@/components/shared/states';
import { DriverActiveTrip } from '@/components/driver/driver-active-trip';
import { DriverInactiveTrip } from '@/components/driver/driver-inactive-trip';
import { useEffect } from 'react';

export default function DriverTripPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const { data: user, isPending: userPending, isError: userError } = useMe();
  const { data: trip, isPending: tripPending } = useActiveTrip();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  const initialLoading =
    (userPending && user === undefined) || (tripPending && trip === undefined);

  if (!token || initialLoading) return <Loading />;

  if (userError || !user) {
    return (
      <Loading label="Could not reach API — check nginx/ngrok host in ALLOWED_DEV_ORIGINS and restart web dev" />
    );
  }

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
