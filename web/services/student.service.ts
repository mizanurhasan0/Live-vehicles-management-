import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Paginated, Student } from '@/types/api.types';

export const studentService = {
  list: (page = 1) => apiGet<Paginated<Student>>('/students', { page, limit: 20 }),
  get: (id: string) => apiGet<Student>(`/students/${id}`),
  create: (body: object) => apiPost<Student>('/students', body),
  update: (id: string, body: object) => apiPatch<Student>(`/students/${id}`, body),
};
