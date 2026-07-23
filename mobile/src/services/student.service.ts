import { apiGet } from '@/lib/api-client';
import type { Paginated, Student } from '@/types/api.types';

export const studentService = {
  list: (page = 1) => apiGet<Paginated<Student>>('/students', { page, limit: 20 }),
};
