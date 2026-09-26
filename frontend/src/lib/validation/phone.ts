/**
 * Bangladeshi Mobile Number Validation and Normalization
 * Standard format: 11 digits starting with 01[3-9]
 */

const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export function isValidBdPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  return BD_PHONE_REGEX.test(cleaned);
}

/**
 * Normalizes input to 11-digit format: 01XXXXXXXXX
 */
export function normalizeBdPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+8801')) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('8801')) {
    return cleaned.slice(2);
  }
  return cleaned;
}
