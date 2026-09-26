import { apiClient } from '@/lib/api/client';
import type { LoginCredentials, AuthSession, RegisterCredentials, AuthResponse, UserProfile } from '../types';

export const authApi = {
  loginAdmin: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/admin/auth/login', credentials),

  logoutAdmin: () =>
    apiClient.post<void>('/admin/auth/logout'),

  getCurrentSession: () =>
    apiClient.get<AuthSession>('/admin/auth/me'),

  loginUser: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  registerUser: (credentials: RegisterCredentials) =>
    apiClient.post<AuthResponse>('/auth/register', credentials),

  logoutUser: () =>
    apiClient.post<void>('/auth/logout'),

  getCurrentUser: () =>
    apiClient.get<UserProfile>('/auth/me'),
};
