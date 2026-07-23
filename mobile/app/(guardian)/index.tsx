import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { EmptyState, Loading } from '@/components/ui';
import { ChildCard } from '@/components/guardian/ChildCard';
import { usePayments, useStudents } from '@/hooks/useAppData';
import { currentMonth } from '@/lib/format';

export default function GuardianHomeScreen() {
  const { t } = useTranslation('guardian');
  const tm = useTranslation('mobile').t;
  const router = useRouter();
  const month = currentMonth();
  const { data, isLoading } = useStudents();
  const { data: payments } = usePayments(month);

  if (isLoading) return <Loading label={tm('home')} />;

  const students = data?.data ?? [];
  const paidIds = new Set(
    (payments?.data ?? [])
      .filter((p) => p.status === 'COMPLETED')
      .map((p) => p.student?.id)
      .filter(Boolean) as string[],
  );

  if (!students.length) return <EmptyState message={t('noChildren')} />;

  return (
    <Screen title={tm('guardianTitle')}>
      <Text style={{ color: '#71717a', marginBottom: 4 }}>{t('homeSubtitle')}</Text>
      {students.map((s) => (
        <ChildCard
          key={s.id}
          student={s}
          paid={paidIds.has(s.id)}
          onTrack={() =>
            router.push({
              pathname: '/(guardian)/tracking',
              params: { vehicleId: s.vehicleId ?? '', studentId: s.id },
            })
          }
          onPay={() =>
            router.push({
              pathname: '/(guardian)/payments',
              params: { studentId: s.id },
            })
          }
        />
      ))}
      <Text style={{ textAlign: 'center', color: '#a1a1aa', fontSize: 12, marginTop: 8 }}>
        {tm('helpHint')}
      </Text>
    </Screen>
  );
}
