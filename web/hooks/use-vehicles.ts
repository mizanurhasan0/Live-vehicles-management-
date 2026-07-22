'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicle.service';
import { toast } from 'sonner';

export function useVehicles(page = 1) {
  return useQuery({ queryKey: ['vehicles', page], queryFn: () => vehicleService.list(page) });
}

export function useVehicleMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['vehicles'] });
  const create = useMutation({
    mutationFn: vehicleService.create,
    onSuccess: () => { invalidate(); toast.success('Created'); },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) => vehicleService.update(id, body),
    onSuccess: () => { invalidate(); toast.success('Updated'); },
  });
  const remove = useMutation({
    mutationFn: vehicleService.remove,
    onSuccess: () => { invalidate(); toast.success('Deleted'); },
  });
  return { create, update, remove };
}
