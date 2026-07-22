'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/driver.service';
import { toast } from 'sonner';

export function useDrivers(page = 1) {
  return useQuery({ queryKey: ['drivers', page], queryFn: () => driverService.list(page) });
}

export function useDriverMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['drivers'] });
  return {
    create: useMutation({
      mutationFn: driverService.create,
      onSuccess: () => { invalidate(); toast.success('Created'); },
    }),
  };
}
