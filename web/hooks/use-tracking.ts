'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService, reportService, trackingService, tripService } from '@/services/tracking.service';
import { currentMonth } from '@/lib/utils';
import { toast } from 'sonner';

export function useLiveVehicles() {
  return useQuery({
    queryKey: ['live-vehicles'],
    queryFn: trackingService.allLive,
    refetchInterval: 15_000,
  });
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

export function useTrips(page = 1) {
  return useQuery({ queryKey: ['trips', page], queryFn: () => tripService.list(page) });
}

export function useActiveTrip() {
  return useQuery({
    queryKey: ['active-trip'],
    queryFn: tripService.active,
    staleTime: 60_000,
    refetchInterval: (query) => (query.state.data ? false : 30_000),
  });
}

export function useTripMutations() {
  const qc = useQueryClient();
  return {
    start: useMutation({
      mutationFn: tripService.start,
      onSuccess: (trip) => {
        qc.setQueryData(['active-trip'], trip);
      },
    }),
    end: useMutation({
      mutationFn: (id: string) => tripService.end(id),
      onSuccess: () => {
        qc.setQueryData(['active-trip'], null);
      },
    }),
    postLocation: useMutation({ mutationFn: trackingService.postLocation }),
  };
}

export function usePayments(page = 1, month?: string) {
  return useQuery({
    queryKey: ['payments', page, month],
    queryFn: () => paymentService.list(page, month),
  });
}

export function usePaymentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['payments'] });
  return {
    initiate: useMutation({
      mutationFn: ({ studentId, month }: { studentId: string; month: string }) =>
        paymentService.initiate(studentId, month),
      onSuccess: () => {
        invalidate();
        toast.success('Payment initiated — complete in bKash sandbox');
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to initiate payment');
      },
    }),
    execute: useMutation({
      mutationFn: (paymentId: string) => paymentService.execute(paymentId),
      onSuccess: (data) => {
        invalidate();
        const status = (data as { status?: string })?.status;
        if (status === 'COMPLETED') {
          toast.success('Payment completed successfully');
        } else {
          toast.error('Payment was not completed');
        }
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to confirm payment');
      },
    }),
    callback: useMutation({
      mutationFn: (body: { paymentID: string; trxID?: string }) =>
        paymentService.callback(body),
      onSuccess: (data) => {
        invalidate();
        const status = (data as { status?: string })?.status;
        if (status === 'COMPLETED') {
          toast.success('Payment completed successfully');
        } else {
          toast.error('Payment was not completed');
        }
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to confirm payment');
      },
    }),
  };
}

export function useReports(month = currentMonth()) {
  return {
    income: useQuery({ queryKey: ['income', month], queryFn: () => reportService.income(month) }),
    pending: useQuery({ queryKey: ['pending', month], queryFn: () => reportService.pending(month) }),
    usage: useQuery({ queryKey: ['usage'], queryFn: reportService.vehicleUsage }),
    drivers: useQuery({ queryKey: ['driver-activity'], queryFn: reportService.driverActivity }),
  };
}
