import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore, hasAuthStoreHydrated } from '@/stores/auth.store';
import { getApiBaseUrl } from '@/lib/public-env';

export const api = axios.create({ timeout: 15000 });

api.interceptors.request.use((config) => {
  const baseURL = getApiBaseUrl();
  config.baseURL = baseURL;
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
      if (hasAuthStoreHydrated()) clearAuth();
      throw error;
    }

    if (refreshing) throw error;
    refreshing = true;
    original._retry = true;

    try {
      const baseURL = getApiBaseUrl();
      const { data } = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken,
      });
      setTokens(data.accessToken, data.refreshToken);
      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${data.accessToken}`,
      };
      return api(original);
    } catch {
      if (hasAuthStoreHydrated()) {
        clearAuth();
      }
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

export const apiPatch = <T>(url: string, body?: object) =>
  api.patch<T>(url, body).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);
