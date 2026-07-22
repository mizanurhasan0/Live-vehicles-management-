'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LiveMap } from '@/components/shared/live-map';
import { Loading } from '@/components/shared/states';
import { useEta, useVehicleLive } from '@/hooks/use-tracking';
import { useTrackingSocket } from '@/hooks/use-tracking-socket';
import { useStudents } from '@/hooks/use-students';
import type { LocationUpdate, Student } from '@/types/api.types';

function ChildPicker({
  students,
  onSelect,
}: {
  students: Student[];
  onSelect: (s: Student) => void;
}) {
  const t = useTranslations('guardian');
  const trackable = students.filter((s) => s.vehicleId);

  if (trackable.length === 0) {
    return <p className="text-sm text-zinc-500">{t('noTrackableChild')}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700">{t('pickChildToTrack')}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0 lg:grid-cols-3">
        {trackable.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            className="shrink-0 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrackingContent() {
  const t = useTranslations('guardian');
  const router = useRouter();
  const params = useSearchParams();
  const vehicleId = params.get('vehicleId') ?? '';
  const studentId = params.get('studentId') ?? undefined;
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data, isLoading } = useVehicleLive(vehicleId || undefined);

  const studentList = students?.data ?? [];
  const student = useMemo(
    () => studentList.find((s) => s.id === studentId),
    [studentList, studentId],
  );

  const [live, setLive] = useState<LocationUpdate | null>(null);

  const onUpdate = useCallback(
    (loc: LocationUpdate) => {
      if (loc.vehicleId === vehicleId) setLive(loc);
    },
    [vehicleId],
  );
  useTrackingSocket(onUpdate);

  const location = live ?? data?.location ?? null;
  const locations = useMemo(() => (location ? [location] : []), [location]);
  const hasLiveGps = !!location;

  const fallbackCenter =
    student?.pickupLat != null && student?.pickupLng != null
      ? ([student.pickupLat, student.pickupLng] as [number, number])
      : undefined;

  const { data: eta } = useEta(vehicleId || undefined, studentId, hasLiveGps);

  const selectChild = (s: Student) => {
    if (!s.vehicleId) return;
    router.push(
      `/guardian/tracking?vehicleId=${s.vehicleId}&studentId=${s.id}`,
    );
  };

  if (studentsLoading) return <Loading />;

  if (!vehicleId) {
    return <ChildPicker students={studentList} onSelect={selectChild} />;
  }

  if (isLoading) return <Loading />;

  const vehicleNumber =
    (data?.vehicle as { number?: string } | undefined)?.number ?? vehicleId;

  return (
    <div className="space-y-3 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-3 lg:col-span-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-zinc-900">
            {student?.name ?? t('liveLocation')}
          </p>
          <p className="text-sm text-zinc-500">
            {t('vehicleNumber', { number: vehicleNumber })}
          </p>
        </div>
        <Link
          href="/guardian/tracking"
          className="text-sm font-medium text-emerald-700"
        >
          {t('changeChild')}
        </Link>
      </div>

      {!hasLiveGps && fallbackCenter && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t('gpsUnavailable')}
        </p>
      )}

      {eta && (
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-100">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('eta')}
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">
            {eta.durationText} · {eta.distanceText}
          </p>
        </div>
      )}

      </div>

      <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-zinc-100 lg:col-span-8">
        <LiveMap
          vehicleId={vehicleId}
          locations={locations}
          center={
            location ? [location.lat, location.lng] : fallbackCenter
          }
          fallbackCenter={fallbackCenter}
          fallbackLabel={student?.pickupPoint ?? t('pickupPoint')}
          mapClassName="h-[400px] lg:h-[min(65vh,600px)]"
        />
      </div>
    </div>
  );
}

export default function GuardianTrackingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrackingContent />
    </Suspense>
  );
}
