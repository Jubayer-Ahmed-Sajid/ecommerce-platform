import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatBdt, formatBdtExact } from './currency.ts';

describe('Currency Formatter (BDT)', () => {
  it('should format whole numbers with Taka symbol and thousand separator', () => {
    assert.equal(formatBdt(1250), '৳ 1,250');
    assert.equal(formatBdt(50000), '৳ 50,000');
    assert.equal(formatBdt(0), '৳ 0');
  });

  it('should handle numeric strings gracefully', () => {
    assert.equal(formatBdt('14500'), '৳ 14,500');
  });

  it('should format exact amounts with two decimal places', () => {
    assert.equal(formatBdtExact(1250), '৳ 1,250.00');
    assert.equal(formatBdtExact(99.5), '৳ 99.50');
  });

  it('should return safe zero for invalid inputs', () => {
    assert.equal(formatBdt('invalid'), '৳ 0');
    assert.equal(formatBdtExact('invalid'), '৳ 0.00');
  });
});
