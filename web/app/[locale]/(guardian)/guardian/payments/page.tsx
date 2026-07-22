'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Select, Label } from '@/components/ui/input';
import { Loading } from '@/components/shared/states';
import { usePaymentMutations, usePayments } from '@/hooks/use-tracking';
import { useStudents } from '@/hooks/use-students';
import { currentMonth, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

type InitiateResponse = {
  payment?: { id: string };
  bkash?: { paymentID: string; bkashURL: string | null };
};

function PaymentsContent() {
  const t = useTranslations('guardian');
  const tc = useTranslations('common');
  const params = useSearchParams();
  const preselect = params.get('studentId') ?? '';
  const month = currentMonth();
  const { data: students, isLoading } = useStudents();
  const { data: payments } = usePayments(1, month);
  const { initiate, execute } = usePaymentMutations();
  const [studentId, setStudentId] = useState('');
  const [pendingPaymentId, setPendingPaymentId] = useState('');
  const [bkashUrl, setBkashUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (preselect) setStudentId(preselect);
  }, [preselect]);

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
          setStep(2);
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
        setStep(1);
      },
    });
  };

  if (isLoading) return <Loading />;

  const selected = (students?.data ?? []).find((s) => s.id === studentId);

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
      <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 lg:text-sm">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              'rounded-full px-3 py-1',
              step >= n ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100',
            )}
          >
            {n === 1 && t('stepSelect')}
            {n === 2 && t('stepBkash')}
            {n === 3 && t('stepConfirm')}
          </span>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
        <Label>{t('selectStudent')}</Label>
        <Select
          className="mt-2"
          value={studentId}
          onChange={(e) => {
            setStudentId(e.target.value);
            setStep(1);
          }}
        >
          <option value="">{tc('select')}</option>
          {(students?.data ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatCurrency(s.monthlyFee)}
            </option>
          ))}
        </Select>

        {selected && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {t('payAmount', { amount: formatCurrency(selected.monthlyFee) })}
          </p>
        )}

        {!pendingPaymentId && (
          <Button
            className="mt-4 h-12 w-full text-base"
            onClick={pay}
            disabled={!studentId || initiate.isPending}
          >
            {t('payWithBkash')}
          </Button>
        )}

        {pendingPaymentId && (
          <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">{t('sandboxHintTitle')}</p>
            <p>{t('sandboxHint')}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {bkashUrl && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => openBkash(bkashUrl)}
                >
                  {t('openBkashAgain')}
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() => {
                  setStep(3);
                  confirm();
                }}
                disabled={execute.isPending}
              >
                {t('confirmPayment')}
              </Button>
            </div>
          </div>
        )}
      </section>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 lg:sticky lg:top-24">
        <h2 className="font-semibold text-zinc-900">
          {t('paymentHistory')} ({month})
        </h2>
        <ul className="mt-3 space-y-2">
          {(payments?.data ?? []).length === 0 && (
            <li className="text-sm text-zinc-500">{tc('empty')}</li>
          )}
          {(payments?.data ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 text-sm"
            >
              <span>{p.student?.name}</span>
              <span className="font-medium">{formatCurrency(p.amount)}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  p.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-zinc-200 text-zinc-700',
                )}
              >
                {p.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function GuardianPaymentsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentsContent />
    </Suspense>
  );
}
