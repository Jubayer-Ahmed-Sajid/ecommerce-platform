import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidBdPhoneNumber, normalizeBdPhoneNumber } from './phone.ts';

describe('Bangladeshi Phone Number Validator', () => {
  it('should validate valid 11-digit mobile numbers', () => {
    assert.equal(isValidBdPhoneNumber('01712345678'), true);
    assert.equal(isValidBdPhoneNumber('01987654321'), true);
    assert.equal(isValidBdPhoneNumber('01300000000'), true);
    assert.equal(isValidBdPhoneNumber('01811223344'), true);
  });

  it('should validate numbers with country code prefix', () => {
    assert.equal(isValidBdPhoneNumber('+8801712345678'), true);
    assert.equal(isValidBdPhoneNumber('8801712345678'), true);
  });

  it('should reject invalid formats and invalid operators', () => {
    assert.equal(isValidBdPhoneNumber('01212345678'), false); // 012 is invalid in BD
    assert.equal(isValidBdPhoneNumber('0171234567'), false); // Too short (10 digits)
    assert.equal(isValidBdPhoneNumber('017123456789'), false); // Too long (12 digits)
    assert.equal(isValidBdPhoneNumber('abc01712345'), false);
    assert.equal(isValidBdPhoneNumber(''), false);
  });

  it('should normalize numbers to standard 11-digit format', () => {
    assert.equal(normalizeBdPhoneNumber('+8801712345678'), '01712345678');
    assert.equal(normalizeBdPhoneNumber('8801712345678'), '01712345678');
    assert.equal(normalizeBdPhoneNumber('01712-345678'), '01712345678');
  });
});
