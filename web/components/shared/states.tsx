export function Loading({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
      {label ?? 'Loading...'}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
