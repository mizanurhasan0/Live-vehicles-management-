'use client';

import { useEffect, useState } from 'react';
import {
  hasAuthStoreHydrated,
  rehydrateAuthStore,
  useAuthStore,
} from '@/stores/auth.store';
import { Loading } from '@/components/shared/states';

export function AuthHydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(hasAuthStoreHydrated());

  useEffect(() => {
    if (hasAuthStoreHydrated()) {
      setReady(true);
      return;
    }

    let active = true;

    const finish = () => {
      if (active) setReady(true);
    };

    try {
      const result = rehydrateAuthStore();
      if (result instanceof Promise) {
        void result.catch(() => useAuthStore.getState().clearAuth()).finally(finish);
      } else {
        finish();
      }
    } catch {
      useAuthStore.getState().clearAuth();
      finish();
    }

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <>{children}</>;
}
