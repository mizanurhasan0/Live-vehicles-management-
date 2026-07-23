import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Badge, Button, Card, Label, Loading } from '@/components/ui';
import { usePaymentMutations, usePayments, useStudents } from '@/hooks/useAppData';
import { currentMonth, formatCurrency } from '@/lib/format';
import { colors } from '@/lib/theme';

export default function GuardianPaymentsScreen() {
  const { t } = useTranslation('guardian');
  const tc = useTranslation('common').t;
  const params = useLocalSearchParams<{ studentId?: string }>();
  const month = currentMonth();
  const { data: students, isLoading } = useStudents();
  const { data: payments } = usePayments(month);
  const { initiate, execute } = usePaymentMutations();
  const [studentId, setStudentId] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [bkashUrl, setBkashUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (params.studentId) setStudentId(String(params.studentId));
  }, [params.studentId]);

  if (isLoading) return <Loading />;

  const list = students?.data ?? [];
  const selected = list.find((s) => s.id === studentId);

  const pay = () => {
    if (!studentId) return;
    initiate.mutate(
      { studentId, month },
      {
        onSuccess: (res) => {
          setPendingId(res.payment?.id ?? '');
          const url = res.bkash?.bkashURL ?? null;
          setBkashUrl(url);
          setStep(2);
          if (url) void Linking.openURL(url);
        },
      },
    );
  };

  const confirm = () => {
    if (!pendingId) return;
    execute.mutate(pendingId, {
      onSuccess: () => {
        setPendingId('');
        setBkashUrl(null);
        setStep(1);
      },
    });
  };

  return (
    <Screen title={t('payWithBkash')}>
      <View style={styles.steps}>
        {[1, 2, 3].map((n) => (
          <Badge
            key={n}
            label={n === 1 ? t('stepSelect') : n === 2 ? t('stepBkash') : t('stepConfirm')}
            tone={step >= n ? 'success' : 'default'}
          />
        ))}
      </View>
      <Card>
        <Label>{t('selectStudent')}</Label>
        {list.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => {
              setStudentId(s.id);
              setStep(1);
            }}
            style={[styles.option, studentId === s.id && styles.optionActive]}
          >
            <Text>{s.name} — {formatCurrency(s.monthlyFee)}</Text>
          </Pressable>
        ))}
        {selected ? (
          <Text style={styles.amount}>{t('payAmount', { amount: formatCurrency(selected.monthlyFee) })}</Text>
        ) : null}
        {!pendingId ? (
          <Button title={t('payWithBkash')} onPress={pay} disabled={!studentId || initiate.isPending} loading={initiate.isPending} />
        ) : null}
      </Card>
      {step >= 2 && bkashUrl ? (
        <Card>
          <Text style={styles.hint}>{t('sandboxHint')}</Text>
          <Button title={t('openBkashAgain')} variant="secondary" onPress={() => void Linking.openURL(bkashUrl)} />
        </Card>
      ) : null}
      {pendingId ? (
        <Button title={t('confirmPayment')} onPress={confirm} loading={execute.isPending} />
      ) : null}
      <Text style={styles.section}>{t('paymentHistory')}</Text>
      {(payments?.data ?? []).map((p) => (
        <Card key={p.id}>
          <Text>{p.student?.name ?? p.invoiceNo}</Text>
          <Text>{formatCurrency(p.amount)} · {p.status}</Text>
        </Card>
      ))}
      {!payments?.data?.length ? <Text style={{ color: colors.muted }}>{tc('empty')}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginTop: 8 },
  optionActive: { borderColor: colors.primary, backgroundColor: '#ecfdf5' },
  amount: { marginTop: 8, fontWeight: '600', color: colors.primaryDark },
  hint: { color: colors.muted, marginBottom: 8, fontSize: 13 },
  section: { fontWeight: '700', fontSize: 16, marginTop: 8 },
});
