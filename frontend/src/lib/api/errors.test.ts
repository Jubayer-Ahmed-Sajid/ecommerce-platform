import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from './errors.ts';

describe('ApiError RFC 7807 Handling', () => {
  it('should correctly expose HTTP status flags', () => {
    const error404 = new ApiError(404, 'Product not found');
    assert.equal(error404.isNotFound, true);
    assert.equal(error404.isValidationError, false);
    assert.equal(error404.isUnauthorized, false);

    const error401 = new ApiError(401, 'Unauthorized');
    assert.equal(error401.isUnauthorized, true);

    const error429 = new ApiError(429, 'Rate limit exceeded');
    assert.equal(error429.isRateLimited, true);

    const error500 = new ApiError(500, 'Server crashed');
    assert.equal(error500.isServerError, true);
  });

  it('should format validation errors into a combined message', () => {
    const validationError = new ApiError(400, 'Validation Failed', {
      title: 'Validation Failed',
      status: 400,
      errors: {
        PhoneNumber: ['Invalid BD format'],
        CustomerName: ['Name is required'],
      },
    });

    assert.equal(validationError.isValidationError, true);
    const combined = validationError.getCombinedValidationMessage();
    assert.equal(combined.includes('PhoneNumber: Invalid BD format'), true);
    assert.equal(combined.includes('CustomerName: Name is required'), true);
  });
});
