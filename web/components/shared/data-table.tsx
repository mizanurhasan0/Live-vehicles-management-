'use client';

import { Table, Td, Th } from '@/components/ui/table';

type Col<T> = { key: string; label: string; render?: (row: T) => React.ReactNode };

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  actions,
}: {
  columns: Col<T>[];
  rows: T[];
  actions?: (row: T) => React.ReactNode;
}) {
  return (
    <Table>
      <thead>
        <tr>
          {columns.map((c) => (
            <Th key={c.key}>{c.label}</Th>
          ))}
          {actions && <Th>Actions</Th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-zinc-50">
            {columns.map((c) => (
              <Td key={c.key}>
                {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
              </Td>
            ))}
            {actions && <Td>{actions(row)}</Td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
