'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { routeService } from '@/services/route.service';
import { toast } from 'sonner';

export function useRoutes(page = 1) {
  return useQuery({ queryKey: ['routes', page], queryFn: () => routeService.list(page) });
}

export function useRouteMutations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: routeService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routes'] });
      toast.success('Created');
    },
  });
}
