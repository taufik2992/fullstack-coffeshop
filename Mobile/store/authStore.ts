import { create } from 'zustand';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { storage } from '../services/storage';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      set({
        user,
        tokens: { accessToken, refreshToken },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const [user, accessToken, refreshToken] = await Promise.all([
        storage.getUser(),
        storage.getAccessToken(),
        storage.getRefreshToken(),
      ]);

      if (user && accessToken && refreshToken) {
        set({
          user,
          tokens: { accessToken, refreshToken },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
