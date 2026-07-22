import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className={cn('w-full text-left text-sm', className)}>{children}</table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-zinc-50 px-4 py-3 font-medium text-zinc-600">{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('border-t border-zinc-100 px-4 py-3', className)}>{children}</td>;
}
