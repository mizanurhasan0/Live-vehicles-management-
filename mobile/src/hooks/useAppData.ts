import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { clearTokens, saveTokens } from '@/lib/token-storage';
import { roleHomePath } from '@/lib/role-path';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  paymentService,
  trackingService,
  tripService,
} from '@/services/tracking.service';
import { studentService } from '@/services/student.service';

export function useMe(enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: enabled && !!token,
  });
}

export function useLogin() {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authService.login(phone, password),
    onSuccess: async (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      await saveTokens(data.accessToken, data.refreshToken);
      const home = roleHomePath(data.user.role);
      if (!home) {
        Alert.alert(t('auth.adminWebOnly'));
        useAuthStore.getState().clearAuth();
        await clearTokens();
        return;
      }
      router.replace(home as never);
    },
    onError: () => Alert.alert(t('common.error')),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  const { refreshToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(refreshToken ?? undefined),
    onSettled: async () => {
      clearAuth();
      await clearTokens();
      qc.clear();
      router.replace('/(auth)/login');
    },
  });
}

export function useActiveTrip() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['active-trip'],
    queryFn: tripService.active,
    enabled: !!token,
    staleTime: 60_000,
    refetchInterval: (q) => (q.state.data ? false : 30_000),
  });
}

export function useTripMutations() {
  const qc = useQueryClient();
  return {
    start: useMutation({
      mutationFn: tripService.start,
      onSuccess: (trip) => qc.setQueryData(['active-trip'], trip),
    }),
    end: useMutation({
      mutationFn: (id: string) => tripService.end(id),
      onSuccess: () => qc.setQueryData(['active-trip'], null),
    }),
    postLocation: useMutation({ mutationFn: trackingService.postLocation }),
  };
}

export function useVehicleLive(id?: string) {
  return useQuery({
    queryKey: ['vehicle-live', id],
    queryFn: () => trackingService.vehicleLive(id!),
    enabled: !!id,
    refetchInterval: 10_000,
  });
}

export function useEta(vehicleId?: string, studentId?: string, enabled = true) {
  return useQuery({
    queryKey: ['eta', vehicleId, studentId],
    queryFn: () => trackingService.eta(vehicleId!, studentId),
    enabled: !!vehicleId && enabled,
    refetchInterval: 30_000,
  });
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.list(1),
  });
}

export function usePayments(month?: string) {
  return useQuery({
    queryKey: ['payments', month],
    queryFn: () => paymentService.list(1, month),
  });
}

export function usePaymentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['payments'] });
  return {
    initiate: useMutation({
      mutationFn: ({ studentId, month }: { studentId: string; month: string }) =>
        paymentService.initiate(studentId, month),
      onSuccess: invalidate,
    }),
    execute: useMutation({
      mutationFn: (paymentId: string) => paymentService.execute(paymentId),
      onSuccess: invalidate,
    }),
    callback: useMutation({
      mutationFn: paymentService.callback,
      onSuccess: invalidate,
    }),
  };
}
