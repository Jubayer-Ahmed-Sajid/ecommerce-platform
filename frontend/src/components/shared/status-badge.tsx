import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus, PaymentStatus } from '@/types/commerce';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'Delivered':
    case 'Paid':
      return <Badge variant="success">{status}</Badge>;
    case 'Processing':
    case 'Shipped':
      return <Badge variant="brand">{status}</Badge>;
    case 'PendingPayment':
    case 'Pending':
      return <Badge variant="warning">{status}</Badge>;
    case 'Cancelled':
    case 'Failed':
    case 'Refunded':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
