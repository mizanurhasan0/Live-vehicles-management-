import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Guardian, Paginated } from '@/types/api.types';

export const guardianService = {
  list: (page = 1) => apiGet<Paginated<Guardian>>('/guardians', { page, limit: 20 }),
  get: (id: string) => apiGet<Guardian>(`/guardians/${id}`),
  create: (body: object) => apiPost<Guardian>('/guardians', body),
  update: (id: string, body: object) => apiPatch<Guardian>(`/guardians/${id}`, body),
};
