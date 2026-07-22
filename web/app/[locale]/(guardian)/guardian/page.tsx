'use client';

import { MapPin, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/shared/states';
import { EmptyState } from '@/components/shared/states';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-tracking';
import { currentMonth, formatCurrency } from '@/lib/utils';

export default function GuardianHomePage() {
  const tg = useTranslations('guardian');
  const tm = useTranslations('mobile');
  const month = currentMonth();
  const { data, isLoading } = useStudents();
  const { data: payments } = usePayments(1, month);

  if (isLoading) return <Loading />;

  const students = data?.data ?? [];
  const paidStudentIds = new Set(
    (payments?.data ?? [])
      .filter((p) => p.status === 'COMPLETED')
      .map((p) => p.student?.id)
      .filter(Boolean) as string[],
  );

  if (students.length === 0) {
    return <EmptyState message={tg('noChildren')} />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <p className="text-sm text-zinc-600 lg:text-base">{tg('homeSubtitle')}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {students.map((s) => {
        const paid = paidStudentIds.has(s.id);
        return (
          <article
            key={s.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">{s.name}</h2>
                  {s.class && (
                    <p className="text-sm text-zinc-600">{s.class}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    paid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {paid ? tg('feePaid') : tg('feeDue')}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                {s.vehicle?.number
                  ? tg('vehicleLabel', { number: s.vehicle.number })
                  : tg('noVehicle')}
              </p>
              <p className="text-sm font-medium text-zinc-800">
                {formatCurrency(s.monthlyFee)} / {tg('monthlyFee')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {s.vehicleId ? (
                <Link
                  href={`/guardian/tracking?vehicleId=${s.vehicleId}&studentId=${s.id}`}
                  className="col-span-1"
                >
                  <Button className="h-12 w-full gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {tg('trackNow')}
                  </Button>
                </Link>
              ) : (
                <Button className="h-12 w-full" disabled>
                  {tg('trackNow')}
                </Button>
              )}
              <Link href={`/guardian/payments?studentId=${s.id}`}>
                <Button variant="secondary" className="h-12 w-full gap-2 text-sm">
                  <Wallet className="h-4 w-4" />
                  {tg('payNow')}
                </Button>
              </Link>
            </div>
          </article>
        );
      })}
      </div>
      <p className="text-center text-xs text-zinc-400 lg:text-sm">{tm('helpHint')}</p>
    </div>
  );
}
