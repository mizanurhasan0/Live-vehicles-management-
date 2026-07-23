import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import type { Student } from '@/types/api.types';
import { colors } from '@/lib/theme';

export function ChildCard({
  student,
  paid,
  onTrack,
  onPay,
}: {
  student: Student;
  paid: boolean;
  onTrack: () => void;
  onPay: () => void;
}) {
  const { t } = useTranslation('guardian');
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{student.name}</Text>
          {student.class ? <Text style={styles.muted}>{student.class}</Text> : null}
        </View>
        <Badge label={paid ? t('feePaid') : t('feeDue')} tone={paid ? 'success' : 'warn'} />
      </View>
      <Text style={styles.muted}>
        {student.vehicle?.number
          ? t('vehicleLabel', { number: student.vehicle.number })
          : t('noVehicle')}
      </Text>
      <Text style={styles.fee}>
        {formatCurrency(student.monthlyFee)} / {t('monthlyFee')}
      </Text>
      <View style={styles.actions}>
        <Button
          title={t('trackNow')}
          onPress={onTrack}
          disabled={!student.vehicleId}
          style={{ flex: 1 }}
        />
        <Button title={t('payNow')} variant="secondary" onPress={onPay} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

export function StudentPicker({
  students,
  selectedId,
  onSelect,
}: {
  students: Student[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation('guardian');
  return (
    <View style={styles.gap}>
      <Text style={styles.prompt}>{t('pickChildToTrack')}</Text>
      {students.map((s) => (
        <Pressable key={s.id} onPress={() => onSelect(s.id)} style={styles.pickRow}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.muted}>{s.vehicle?.number ?? t('noVehicle')}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  fee: { fontWeight: '600', color: colors.text },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  gap: { gap: 8 },
  prompt: { fontSize: 15, color: colors.muted },
  pickRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
