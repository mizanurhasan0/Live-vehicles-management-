'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthHydrationGate } from '@/components/auth/auth-hydration-gate';
import { makeQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      <AuthHydrationGate>{children}</AuthHydrationGate>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
