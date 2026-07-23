import axios, { type AxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '@/lib/env';
import { useAuthStore } from '@/stores/auth.store';
import { clearTokens, saveTokens } from '@/lib/token-storage';

export const api = axios.create({ timeout: 15000 });

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) throw error;

    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
    if (!refreshToken) {
      clearAuth();
      await clearTokens();
      throw error;
    }

    if (refreshing) throw error;
    refreshing = true;
    original._retry = true;

    try {
      const { data } = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
        refreshToken,
      });
      setTokens(data.accessToken, data.refreshToken);
      await saveTokens(data.accessToken, data.refreshToken);
      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${data.accessToken}`,
      };
      return api(original);
    } catch {
      clearAuth();
      await clearTokens();
      throw error;
    } finally {
      refreshing = false;
    }
  },
);

export const apiGet = <T>(url: string, params?: object) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, body?: object) =>
  api.post<T>(url, body).then((r) => r.data);
