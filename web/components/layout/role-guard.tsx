'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/api.types';

const rolePath: Record<Role, string> = {
  ADMIN: '/admin',
  GUARDIAN: '/guardian',
  DRIVER: '/driver',
};

export function RoleGuard({
  role,
  children,
}: {
  role: Role | Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const allowed = Array.isArray(role) ? role : [role];

  useEffect(() => {
    if (!user && !accessToken) {
      router.replace('/login');
      return;
    }
    if (user && !allowed.includes(user.role)) {
      router.replace(rolePath[user.role]);
    }
  }, [user, accessToken, allowed, router]);

  if (!user || !allowed.includes(user.role)) return null;
  return <>{children}</>;
}
