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

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setReady(true);
    });

    try {
      const result = rehydrateAuthStore();
      if (!(result instanceof Promise)) {
        setReady(true);
      } else {
        void result.catch(() => useAuthStore.getState().clearAuth());
      }
    } catch {
      useAuthStore.getState().clearAuth();
      setReady(true);
    }

    const fallback = window.setTimeout(() => setReady(true), 2500);

    return () => {
      unsub();
      window.clearTimeout(fallback);
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
};
