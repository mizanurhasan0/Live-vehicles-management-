import { apiGet, apiPost } from '@/lib/api-client';
import type { AuthResponse, User } from '@/types/api.types';

export const authService = {
  login: (phone: string, password: string) =>
    apiPost<AuthResponse>('/auth/login', { phone, password }),
  me: () => apiGet<User>('/auth/me'),
  logout: (refreshToken?: string) =>
    apiPost('/auth/logout', refreshToken ? { refreshToken } : {}),
};
