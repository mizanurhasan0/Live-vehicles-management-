import { useCallback, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Button, Card, Loading } from '@/components/ui';
import { TripMap } from '@/components/shared/TripMap';
import { StudentPicker } from '@/components/guardian/ChildCard';
import { useEta, useStudents, useVehicleLive } from '@/hooks/useAppData';
import { useTrackingSocket } from '@/hooks/useTrackingSocket';
import type { LocationUpdate } from '@/types/api.types';

export default function GuardianTrackingScreen() {
  const { t } = useTranslation('guardian');
  const params = useLocalSearchParams<{ vehicleId?: string; studentId?: string }>();
  const { data: studentsData, isLoading } = useStudents();
  const students = useMemo(
    () => (studentsData?.data ?? []).filter((s) => s.vehicleId),
    [studentsData],
  );

  const [vehicleId, setVehicleId] = useState(params.vehicleId ?? '');
  const [studentId, setStudentId] = useState(params.studentId ?? '');

  const student = students.find((s) => s.id === studentId) ?? students.find((s) => s.vehicleId === vehicleId);
  const vid = vehicleId || student?.vehicleId || '';
  const sid = studentId || student?.id || '';

  const { data: live } = useVehicleLive(vid || undefined);
  const { data: eta } = useEta(vid || undefined, sid || undefined, !!live?.location);
  const [socketLoc, setSocketLoc] = useState<LocationUpdate | null>(null);

  const onSocket = useCallback(
    (data: LocationUpdate) => {
      if (data.vehicleId === vid) setSocketLoc(data);
    },
    [vid],
  );
  useTrackingSocket(onSocket);

  const location = socketLoc ?? live?.location ?? null;
  const fallback =
    student?.pickupLat && student?.pickupLng
      ? { lat: student.pickupLat, lng: student.pickupLng }
      : undefined;

  if (isLoading) return <Loading />;

  if (!vid && !students.length) {
    return (
      <Screen title={t('liveLocation')}>
        <Text>{t('noTrackableChild')}</Text>
      </Screen>
    );
  }

  if (!vid) {
    return (
      <Screen title={t('liveLocation')}>
        <StudentPicker
          students={students}
          selectedId={sid}
          onSelect={(id) => {
            const s = students.find((x) => x.id === id);
            setStudentId(id);
            setVehicleId(s?.vehicleId ?? '');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t('liveLocation')}>
      {student ? (
        <Card>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>{student.name}</Text>
          {student.vehicle?.number ? (
            <Text>{t('vehicleNumber', { number: student.vehicle.number })}</Text>
          ) : null}
        </Card>
      ) : null}
      <TripMap location={location} fallback={fallback} />
      {!location && fallback ? (
        <Text style={{ color: '#71717a' }}>{t('gpsUnavailable')}</Text>
      ) : !location ? (
        <Text style={{ color: '#71717a' }}>{t('noLocationData')}</Text>
      ) : null}
      {eta ? (
        <Card>
          <Text style={{ fontWeight: '600' }}>{t('eta')}</Text>
          <Text>
            {eta.durationText} · {eta.distanceText}
          </Text>
        </Card>
      ) : null}
      <Button
        title={t('changeChild')}
        variant="secondary"
        onPress={() => {
          setVehicleId('');
          setStudentId('');
        }}
      />
    </Screen>
  );
}
