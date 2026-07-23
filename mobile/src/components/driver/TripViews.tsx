import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/components/ui';
import { TripMap } from '@/components/shared/TripMap';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useTripMutations, useVehicleLive } from '@/hooks/useAppData';
import { useTrackingSocket } from '@/hooks/useTrackingSocket';
import type { Trip, User, LocationUpdate } from '@/types/api.types';
import { colors } from '@/lib/theme';

export function DriverInactiveTrip({ user, onStart }: { user: User; onStart: () => void }) {
  const { t } = useTranslation();
  const vehicle = user.driver?.vehicle;

  return (
    <View style={styles.gap}>
      <Card>
        <Text style={styles.h2}>{t('driver.noTrip')}</Text>
        <Text style={styles.muted}>{t('driver.startTripHint')}</Text>
        {vehicle ? (
          <Text style={styles.vehicle}>
            {t('driver.assignedVehicle')}: {vehicle.number}
            {vehicle.route?.name ? ` · ${vehicle.route.name}` : ''}
          </Text>
        ) : (
          <Text style={styles.muted}>{t('driver.noVehicle')}</Text>
        )}
      </Card>
      <Button title={t('driver.startTrip')} onPress={onStart} disabled={!vehicle} />
    </View>
  );
}

export function DriverActiveTrip({ trip, user }: { trip: Trip; user: User }) {
  const { t } = useTranslation();
  const vehicleId = trip.vehicle?.id ?? user.driver?.vehicle?.id;
  const { end, postLocation } = useTripMutations();
  const { location: gps, gpsState, requestLocation } = useDriverLocation(vehicleId, true);
  const { data: live } = useVehicleLive(vehicleId);
  const [socketLoc, setSocketLoc] = useState<LocationUpdate | null>(null);
  const lastPost = useRef(0);

  useTrackingSocket((data) => {
    if (data.vehicleId === vehicleId) setSocketLoc(data);
  });

  const location = gps ?? socketLoc ?? live?.location ?? null;

  useEffect(() => {
    if (!gps || gpsState !== 'active') return;
    const now = Date.now();
    if (now - lastPost.current < 8000) return;
    lastPost.current = now;
    postLocation.mutate({ lat: gps.lat, lng: gps.lng, speed: gps.speed ?? 0 });
  }, [gps, gpsState, postLocation]);

  return (
    <View style={styles.gap}>
      <View style={styles.banner}>
        <Text style={styles.bannerSub}>{t('driver.tripRunning')}</Text>
        <Text style={styles.bannerTitle}>{t('driver.activeTrip')}</Text>
      </View>
      <TripMap location={location} />
      <Card>
        <Text style={styles.label}>{t('driver.currentLocation')}</Text>
        <Text style={styles.mono}>
          {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : '—'}
        </Text>
        {gpsState === 'denied' && (
          <>
            <Text style={styles.warn}>{t('driver.gpsDenied')}</Text>
            <Button title={t('driver.enableGps')} onPress={() => void requestLocation()} variant="secondary" />
          </>
        )}
        {gpsState === 'loading' && <Text style={styles.muted}>{t('driver.gpsLoading')}</Text>}
      </Card>
      <Button
        title={t('driver.endTrip')}
        variant="danger"
        loading={end.isPending}
        onPress={() => end.mutate(trip.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
  vehicle: { marginTop: 8, fontWeight: '600', color: colors.primaryDark },
  banner: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, alignItems: 'center' },
  bannerSub: { color: '#d1fae5', fontSize: 13 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  label: { fontSize: 12, color: colors.muted },
  mono: { fontFamily: 'monospace', fontSize: 14, fontWeight: '600', marginTop: 4 },
  warn: { color: colors.danger, marginTop: 8, marginBottom: 8 },
});
