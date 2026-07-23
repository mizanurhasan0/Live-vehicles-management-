import { create } from 'zustand';
import type { User } from '@/types/api.types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setAuth: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  clearAuth: () =>
    set({ user: null, accessToken: null, refreshToken: null }),
  setHydrated: (hydrated) => set({ hydrated }),
}));
