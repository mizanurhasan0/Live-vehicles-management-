import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Driver, Paginated } from '@/types/api.types';

export const driverService = {
  list: (page = 1) => apiGet<Paginated<Driver>>('/drivers', { page, limit: 20 }),
  get: (id: string) => apiGet<Driver>(`/drivers/${id}`),
  create: (body: object) => apiPost<Driver>('/drivers', body),
  update: (id: string, body: object) => apiPatch<Driver>(`/drivers/${id}`, body),
};
