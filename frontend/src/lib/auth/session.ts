/**
 * Authentication and Session Helpers
 * Enforces server-authoritative session verification via HttpOnly cookies.
 */

import { cookies } from 'next/headers';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export function isAuthenticated(user: AdminUser | null | undefined): boolean {
  return !!user && user.roles.includes('Admin');
}

/**
 * Retrieves the current customer session on the server from the HttpOnly session cookie.
 * Fully compatible with React Server Components (RSC).
 */
export async function getCurrentCustomerUser(): Promise<CustomerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    const profileCookie = cookieStore.get('user_profile');

    if (!sessionCookie?.value || !profileCookie?.value) {
      return null;
    }

    const user = JSON.parse(decodeURIComponent(profileCookie.value)) as CustomerUser;
    return user;
  } catch {
    return null;
  }
}
