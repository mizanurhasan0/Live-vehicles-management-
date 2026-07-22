'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Select, Label } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { usePaymentMutations, usePayments } from '@/hooks/use-tracking';
import { useStudents } from '@/hooks/use-students';
import { currentMonth, formatCurrency } from '@/lib/utils';

type InitiateResponse = {
  payment?: { id: string };
  bkash?: { paymentID: string; bkashURL: string | null };
};

export default function GuardianPaymentsPage() {
  const t = useTranslations('guardian');
  const tc = useTranslations('common');
  const month = currentMonth();
  const { data: students } = useStudents();
  const { data: payments } = usePayments(1, month);
  const { initiate, execute } = usePaymentMutations();
  const [studentId, setStudentId] = useState('');
  const [pendingPaymentId, setPendingPaymentId] = useState('');
  const [bkashUrl, setBkashUrl] = useState<string | null>(null);

  const openBkash = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const pay = () => {
    if (!studentId) return;
    initiate.mutate(
      { studentId, month },
      {
        onSuccess: (res) => {
          const data = res as InitiateResponse;
          setPendingPaymentId(data.payment?.id ?? '');
          const url = data.bkash?.bkashURL ?? null;
          setBkashUrl(url);
          if (url) openBkash(url);
        },
      },
    );
  };

  const confirm = () => {
    if (!pendingPaymentId) return;
    execute.mutate(pendingPaymentId, {
      onSuccess: () => {
        setPendingPaymentId('');
        setBkashUrl(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('payFee')} />
      <Card>
        <CardTitle>{t('payFee')}</CardTitle>
        <div className="mt-3 space-y-3">
          <div>
            <Label>{t('selectStudent')}</Label>
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">{tc('select')}</option>
              {(students?.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatCurrency(s.monthlyFee)}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={pay} disabled={!studentId || initiate.isPending}>
            {t('payWithBkash')}
          </Button>

          {pendingPaymentId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">{t('sandboxHintTitle')}</p>
              <p className="mt-1">{t('sandboxHint')}</p>
              {bkashUrl && (
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => openBkash(bkashUrl)}
                >
                  {t('openBkashAgain')}
                </Button>
              )}
              <Button
                className="mt-3 ml-2"
                variant="secondary"
                onClick={confirm}
                disabled={execute.isPending}
              >
                {t('confirmPayment')}
              </Button>
            </div>
          )}
        </div>
      </Card>
      <Card>
        <CardTitle>
          {t('paymentHistory')} ({month})
        </CardTitle>
        <ul className="mt-2 space-y-2 text-sm">
          {(payments?.data ?? []).map((p) => (
            <li key={p.id}>
              {p.student?.name} — {formatCurrency(p.amount)} — {p.status}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
