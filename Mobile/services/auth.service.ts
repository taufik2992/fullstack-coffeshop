import { apiClient } from './api.client';
import { storage } from './storage';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from '../types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      credentials
    );

    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      await storage.setTokens(accessToken, refreshToken);
      await storage.setUser(user);
    }

    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/api/v1/auth/register',
      data
    );
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken });
      }
    } finally {
      await storage.clearAuth();
    }
  },

  async getCurrentUser() {
    return await storage.getUser();
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/v1/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/api/v1/auth/reset-password', { token, password });
  },
};
