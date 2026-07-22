'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { useActiveTrip, useTripMutations } from '@/hooks/use-tracking';
import { toast } from 'sonner';

export default function DriverTripPage() {
  const td = useTranslations('driver');
  const { data: trip, isLoading } = useActiveTrip();
  const { start, end, postLocation } = useTripMutations();

  useEffect(() => {
    if (!trip?.id) return;
    if (!navigator.geolocation) return;
    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        postLocation.mutate({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed ?? 0,
        });
      });
    }, 10_000);
    return () => clearInterval(id);
  }, [trip?.id, postLocation]);

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title={td('activeTrip')} />
      <Card>
        <CardTitle>{trip ? td('activeTrip') : td('noTrip')}</CardTitle>
        {trip ? (
          <div className="mt-3 space-y-2">
            <Badge status={trip.status} />
            <p className="text-sm">Vehicle: {trip.vehicle?.number}</p>
            <p className="text-sm text-emerald-700">{td('gpsActive')}</p>
            <Button variant="danger" onClick={() => end.mutate(trip.id)}>{td('endTrip')}</Button>
          </div>
        ) : (
          <Button className="mt-3" onClick={() => start.mutate(undefined, { onError: () => toast.error('Start failed') })}>
            {td('startTrip')}
          </Button>
        )}
      </Card>
    </div>
  );
}
