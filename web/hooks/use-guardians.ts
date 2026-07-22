'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guardianService } from '@/services/guardian.service';
import { toast } from 'sonner';

export function useGuardians(page = 1) {
  return useQuery({ queryKey: ['guardians', page], queryFn: () => guardianService.list(page) });
}

export function useGuardianMutations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: guardianService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Created');
    },
  });
}
