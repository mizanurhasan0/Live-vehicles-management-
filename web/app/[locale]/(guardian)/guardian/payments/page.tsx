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
import { toast } from 'sonner';

export default function GuardianPaymentsPage() {
  const t = useTranslations('guardian');
  const tc = useTranslations('common');
  const month = currentMonth();
  const { data: students } = useStudents();
  const { data: payments } = usePayments(1, month);
  const { initiate, execute } = usePaymentMutations();
  const [studentId, setStudentId] = useState('');
  const [pendingPaymentId, setPendingPaymentId] = useState('');

  const pay = () => {
    if (!studentId) return;
    initiate.mutate({ studentId, month }, {
      onSuccess: (res) => {
        const data = res as { payment?: { id: string } };
        setPendingPaymentId(data.payment?.id ?? '');
        toast.success('Payment initiated — complete in bKash sandbox');
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
            <Label>Student</Label>
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select</option>
              {(students?.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {formatCurrency(s.monthlyFee)}</option>
              ))}
            </Select>
          </div>
          <Button onClick={pay} disabled={initiate.isPending}>{tc('submit')}</Button>
          {pendingPaymentId && (
            <Button variant="secondary" onClick={() => execute.mutate(pendingPaymentId)}>
              Execute Payment
            </Button>
          )}
        </div>
      </Card>
      <Card>
        <CardTitle>History ({month})</CardTitle>
        <ul className="mt-2 space-y-2 text-sm">
          {(payments?.data ?? []).map((p) => (
            <li key={p.id}>{p.student?.name} — {formatCurrency(p.amount)} — {p.status}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
