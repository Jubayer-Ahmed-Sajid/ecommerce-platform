/**
 * Currency formatting utility for Bangladeshi Taka (BDT).
 */

export function formatBdt(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '৳ 0';
  }

  // Use en-BD locale formatting for standard Bangladeshi digit groupings
  return `৳ ${numericAmount.toLocaleString('en-BD', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export function formatBdtExact(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '৳ 0.00';
  }

  return `৳ ${numericAmount.toLocaleString('en-BD', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}
