import { useEffect } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { Loading } from '@/components/ui';
import { usePaymentMutations } from '@/hooks/useAppData';

export default function PaymentCallbackScreen() {
  const { t } = useTranslation('guardian');
  const router = useRouter();
  const params = useLocalSearchParams<{ paymentID?: string; trxID?: string; status?: string }>();
  const { callback } = usePaymentMutations();

  useEffect(() => {
    const paymentID = params.paymentID;
    if (!paymentID) return;
    callback.mutate(
      { paymentID: String(paymentID), trxID: params.trxID ? String(params.trxID) : undefined, status: params.status ? String(params.status) : undefined },
      { onSettled: () => router.replace('/(guardian)/payments') },
    );
  }, [params.paymentID, params.trxID, params.status, callback, router]);

  return (
    <Screen title={t('confirmPayment')}>
      <Loading label={t('confirmingPayment')} />
      <Text style={{ textAlign: 'center', color: '#71717a' }}>{t('sandboxHint')}</Text>
    </Screen>
  );
}
