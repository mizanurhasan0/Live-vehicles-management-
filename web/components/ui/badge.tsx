import { cn } from '@/lib/utils';

const colors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  ON_TRIP: 'bg-blue-100 text-blue-800',
  INACTIVE: 'bg-zinc-100 text-zinc-600',
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
  STARTED: 'bg-blue-100 text-blue-800',
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        colors[status] ?? 'bg-zinc-100 text-zinc-700',
      )}
    >
      {status}
    </span>
  );
}
