import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Paginated, Vehicle } from '@/types/api.types';

export const vehicleService = {
  list: (page = 1) => apiGet<Paginated<Vehicle>>('/vehicles', { page, limit: 20 }),
  get: (id: string) => apiGet<Vehicle>(`/vehicles/${id}`),
  create: (body: object) => apiPost<Vehicle>('/vehicles', body),
  update: (id: string, body: object) => apiPatch<Vehicle>(`/vehicles/${id}`, body),
  remove: (id: string) => apiDelete(`/vehicles/${id}`),
};
