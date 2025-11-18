import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("api/v1/auth/login", payload),
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("api/v1/auth/register", payload),
  refresh: (token: string) =>
    api.post<AuthResponse>("api/v1/auth/refresh", { token }),
  logout: (token: string) => api.post("api/v1/auth/logout", {}, token),
};
