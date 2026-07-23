import type { Role } from '@/types/api.types';

export function roleHomePath(role: Role): string | null {
  if (role === 'DRIVER') return '/(driver)';
  if (role === 'GUARDIAN') return '/(guardian)';
  return null;
}
