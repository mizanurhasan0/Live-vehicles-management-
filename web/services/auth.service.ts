import { api, apiGet, apiPost } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthResponse, User } from '@/types/api.types';

export const authService = {
  login: (phone: string, password: string) =>
    apiPost<AuthResponse>('/auth/login', { phone, password }),
  me: () => apiGet<User>('/auth/me'),
  logout: (refreshToken?: string) =>
    apiPost('/auth/logout', { refreshToken }),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    const token = useAuthStore.getState().accessToken;
    return api
      .post<User>('/auth/me/photo', form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((r) => r.data);
  },
};
