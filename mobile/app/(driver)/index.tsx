import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Loading } from '@/components/ui';
import { DriverActiveTrip, DriverInactiveTrip } from '@/components/driver/TripViews';
import { useActiveTrip, useTripMutations } from '@/hooks/useAppData';
import { useAuthStore } from '@/stores/auth.store';

export default function DriverTripScreen() {
  const { t } = useTranslation('mobile');
  const user = useAuthStore((s) => s.user)!;
  const { data: trip, isLoading } = useActiveTrip();
  const { start } = useTripMutations();

  if (isLoading) return <Loading label={t('trip')} />;

  return (
    <Screen title={t('driverTitle')}>
      {trip ? (
        <DriverActiveTrip trip={trip} user={user} />
      ) : (
        <DriverInactiveTrip user={user} onStart={() => start.mutate()} />
      )}
    </Screen>
  );
}
