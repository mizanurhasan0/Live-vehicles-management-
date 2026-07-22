import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Paginated, Route } from '@/types/api.types';

export const routeService = {
  list: (page = 1) => apiGet<Paginated<Route>>('/routes', { page, limit: 20 }),
  get: (id: string) => apiGet<Route>(`/routes/${id}`),
  create: (body: object) => apiPost<Route>('/routes', body),
  update: (id: string, body: object) => apiPatch<Route>(`/routes/${id}`, body),
  remove: (id: string) => apiDelete(`/routes/${id}`),
};
