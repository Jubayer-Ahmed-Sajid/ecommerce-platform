/**
 * Authentication and Session Helpers
 * Enforces server-authoritative session verification.
 */

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export function isAuthenticated(user: AdminUser | null | undefined): boolean {
  return !!user && user.roles.includes('Admin');
}
