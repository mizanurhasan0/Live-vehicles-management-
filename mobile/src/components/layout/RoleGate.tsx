import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { roleHomePath } from '@/lib/role-path';
import type { Role } from '@/types/api.types';

export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    if (user.role !== role) {
      const home = roleHomePath(user.role);
      router.replace(home ? (home as never) : '/(auth)/login');
    }
  }, [hydrated, user, role, router]);

  if (!hydrated || !user || user.role !== role) return null;
  return <>{children}</>;
}
