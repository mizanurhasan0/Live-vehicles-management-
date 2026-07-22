'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/states';
import { Link } from '@/i18n/navigation';
import { usePaymentMutations } from '@/hooks/use-tracking';

function CallbackContent() {
  const t = useTranslations('guardian');
  const params = useSearchParams();
  const bkashPaymentId = params.get('paymentID') ?? params.get('paymentId') ?? '';
  const trxId = params.get('trxID') ?? undefined;
  const { callback } = usePaymentMutations();
  const autoCalled = useRef(false);

  useEffect(() => {
    if (bkashPaymentId && !autoCalled.current) {
      autoCalled.current = true;
      callback.mutate({ paymentID: bkashPaymentId, trxID: trxId });
    }
  }, [bkashPaymentId, trxId, callback]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('paymentCallback')} />
      <Card>
        <CardTitle>{t('confirmPayment')}</CardTitle>
        <p className="mt-2 text-sm text-zinc-600">{t('callbackHint')}</p>
        {bkashPaymentId && (
          <p className="mt-2 text-xs text-zinc-500">
            bKash ID: {bkashPaymentId}
          </p>
        )}
        {callback.isPending && (
          <p className="mt-2 text-sm text-zinc-600">{t('confirmingPayment')}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() =>
              bkashPaymentId && callback.mutate({ paymentID: bkashPaymentId, trxID: trxId })
            }
            disabled={!bkashPaymentId || callback.isPending}
          >
            {t('confirmPayment')}
          </Button>
          <Link href="/guardian/payments">
            <Button variant="secondary">{t('backToPayments')}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CallbackContent />
    </Suspense>
  );
}
