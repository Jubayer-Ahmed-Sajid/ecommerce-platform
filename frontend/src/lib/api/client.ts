import { ApiError, NetworkError } from './errors';
import type { ProblemDetails } from '@/types/api';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

let cachedDevAdminToken: string | null = null;
let cachedDevTokenExpires = 0;

async function getDevAdminToken(baseUrl: string): Promise<string | null> {
  const now = Date.now();
  if (cachedDevAdminToken && cachedDevTokenExpires > now + 60000) {
    return cachedDevAdminToken;
  }
  try {
    const res = await fetch(`${baseUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'AdminPassword123!',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) {
        cachedDevAdminToken = data.token;
        cachedDevTokenExpires = data.expiresAt ? new Date(data.expiresAt).getTime() : now + 3600000;
        return cachedDevAdminToken;
      }
    }
  } catch {
    // Ignore dev fallback errors
  }
  return null;
}

/**
 * Core HTTP Client Wrapper
 * Centralizes all communication between Next.js and the ASP.NET Core Web API.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const isServer = typeof window === 'undefined';
  const baseUrl = (isServer ? process.env.INTERNAL_API_URL : undefined)
    || process.env.NEXT_PUBLIC_API_URL
    || DEFAULT_API_BASE_URL;
  
  // Format URL query parameters
  let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, application/problem+json');
  }

  // Forward authentication token from cookies if not explicitly provided
  if (!headers.has('Authorization')) {
    if (isServer) {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('admin_session')?.value;
        const userToken = cookieStore.get('user_session')?.value;
        const token = adminToken || userToken;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
          headers.set('Cookie', `admin_session=${token}`);
        } else if (process.env.NODE_ENV === 'development' && endpoint.includes('/admin/')) {
          const devToken = await getDevAdminToken(baseUrl);
          if (devToken) {
            headers.set('Authorization', `Bearer ${devToken}`);
            headers.set('Cookie', `admin_session=${devToken}`);
          }
        }
      } catch {
        if (process.env.NODE_ENV === 'development' && endpoint.includes('/admin/')) {
          const devToken = await getDevAdminToken(baseUrl);
          if (devToken) {
            headers.set('Authorization', `Bearer ${devToken}`);
            headers.set('Cookie', `admin_session=${devToken}`);
          }
        }
      }
    } else {
      try {
        const match = document.cookie.match(/(?:^|;\s*)(admin_session|user_session)=([^;]+)/);
        if (match && match[2]) {
          headers.set('Authorization', `Bearer ${match[2]}`);
        }
      } catch {
        // Browser environment without document.cookie
      }
    }
  }

  const serializedBody =
    options.body instanceof FormData
      ? options.body
      : options.body !== undefined
      ? JSON.stringify(options.body)
      : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: serializedBody,
      credentials: options.credentials ?? 'include', // Ensures HttpOnly cookies pass for admin/session
    });
  } catch (err) {
    if (err instanceof TypeError && (
      err.message.toLowerCase().includes('fetch') ||
      err.message.toLowerCase().includes('network') ||
      err.message.toLowerCase().includes('failed')
    )) {
      throw new NetworkError();
    }
    throw err;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  // Handle Failure Responses
  if (!response.ok) {
    let problemDetails: ProblemDetails | undefined;
    let errorMessage = `HTTP request failed with status ${response.status}`;

    try {
      const errorJson = await response.json();
      if (errorJson && typeof errorJson === 'object') {
        problemDetails = errorJson as ProblemDetails;
        errorMessage = problemDetails.detail || problemDetails.title || errorMessage;
      }
    } catch {
      // Body was not JSON (e.g. 502 Bad Gateway from Nginx)
      const rawText = await response.text().catch(() => '');
      if (rawText) {
        errorMessage = rawText;
      }
    }

    throw new ApiError(response.status, errorMessage, problemDetails);
  }

  // Handle Successful JSON Response
  try {
    return (await response.json()) as T;
  } catch {
    return null as T;
  }
}

// Convenience helpers
apiClient.get = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'POST', body });

apiClient.put = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'PUT', body });

apiClient.patch = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'PATCH', body });

apiClient.delete = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
