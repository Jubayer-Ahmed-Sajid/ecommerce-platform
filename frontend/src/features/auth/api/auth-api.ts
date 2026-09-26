import { apiClient } from '@/lib/api/client';
import type { LoginCredentials, AuthSession, RegisterCredentials, AuthResponse, UserProfile } from '../types';

export const authApi = {
  loginAdmin: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/admin/auth/login', credentials),

  logoutAdmin: () =>
    apiClient.post<void>('/admin/auth/logout'),

  getCurrentSession: () =>
    apiClient.get<AuthSession>('/admin/auth/me'),

  // Sync Firebase JWT with server HttpOnly cookie session
  syncSession: async (idToken: string, user: UserProfile): Promise<{ success: boolean; user: UserProfile }> => {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, user }),
    });
    if (!res.ok) {
      throw new Error('Failed to create server session.');
    }
    return res.json();
  },

  // Clear HttpOnly cookie session
  logoutSession: async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  // Get current user profile from HttpOnly cookie session with backend fallback
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          return data.user as UserProfile;
        }
      }
    } catch {
      // Fall through to backend endpoint if local session fails
    }
    return apiClient.get<UserProfile>('/auth/me');
  },

  loginUser: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  registerUser: (credentials: RegisterCredentials) =>
    apiClient.post<AuthResponse>('/auth/register', credentials),

  logoutUser: () =>
    apiClient.post<void>('/auth/logout'),
};
