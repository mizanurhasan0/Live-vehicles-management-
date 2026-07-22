'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/api.types';
import { toast } from 'sonner';

const rolePath: Record<Role, string> = {
  ADMIN: '/admin',
  GUARDIAN: '/guardian',
  DRIVER: '/driver',
};

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: !!token,
  });
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authService.login(phone, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace(rolePath[data.user.role]);
    },
    onError: () => toast.error('Login failed'),
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(refreshToken ?? undefined),
    onSettled: () => {
      clearAuth();
      qc.clear();
      router.replace('/login');
    },
  });
}
