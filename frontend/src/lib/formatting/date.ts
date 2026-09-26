/**
 * Date formatting utility for storefront and admin auditing.
 */

export function formatDate(dateStringOrTimestamp: string | number | Date): string {
  try {
    const date = new Date(dateStringOrTimestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateStringOrTimestamp: string | number | Date): string {
  try {
    const date = new Date(dateStringOrTimestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}
