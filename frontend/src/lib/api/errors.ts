import type { ProblemDetails } from '@/types/api';

/**
 * Standard API error class encapsulating RFC 7807 Problem Details.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly problemDetails?: ProblemDetails;
  public readonly validationErrors?: Record<string, string[]>;

  constructor(status: number, message: string, problemDetails?: ProblemDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetails = problemDetails;
    this.validationErrors = problemDetails?.errors;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public get isValidationError(): boolean {
    return this.status === 400 && !!this.validationErrors;
  }

  public get isUnauthorized(): boolean {
    return this.status === 401;
  }

  public get isForbidden(): boolean {
    return this.status === 403;
  }

  public get isNotFound(): boolean {
    return this.status === 404;
  }

  public get isRateLimited(): boolean {
    return this.status === 429;
  }

  public get isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Returns a friendly formatted string of all validation errors.
   */
  public getCombinedValidationMessage(): string {
    if (!this.validationErrors) {
      return this.message;
    }
    return Object.entries(this.validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join(' | ');
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network connectivity error. Please check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
