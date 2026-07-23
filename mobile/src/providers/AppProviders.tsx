import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import '@/i18n';
import { loadTokens } from '@/lib/token-storage';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { roleHomePath } from '@/lib/role-path';
import { Loading } from '@/components/ui';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AuthBootstrap({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [booting, setBooting] = useState(true);
  const { setAuth, setTokens, setHydrated, accessToken, user } = useAuthStore();

  useEffect(() => {
    void (async () => {
      const tokens = await loadTokens();
      if (tokens.accessToken && tokens.refreshToken) {
        setTokens(tokens.accessToken, tokens.refreshToken);
        try {
          const me = await authService.me();
          setAuth(me, tokens.accessToken, tokens.refreshToken);
        } catch {
          useAuthStore.getState().clearAuth();
        }
      }
      setHydrated(true);
      setBooting(false);
    })();
  }, [setAuth, setTokens, setHydrated]);

  useEffect(() => {
    if (booting || !useAuthStore.getState().hydrated) return;
    const inAuth = segments[0] === '(auth)';
    if (!accessToken || !user) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }
    if (inAuth) {
      const home = roleHomePath(user.role);
      if (home) router.replace(home as never);
    }
  }, [booting, accessToken, user, segments, router]);

  if (booting) return <Loading />;
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryClientProvider>
  );
}
