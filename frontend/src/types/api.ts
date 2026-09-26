/**
 * Shared API Contract Types
 * Conforms to RFC 7807 Problem Details and Backend API envelope standards.
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  isSuccess: boolean;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
