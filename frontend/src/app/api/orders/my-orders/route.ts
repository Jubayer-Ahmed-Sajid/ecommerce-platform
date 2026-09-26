import { NextResponse } from 'next/server';
import { getCurrentCustomerUser } from '@/lib/auth/session';
import { apiClient } from '@/lib/api/client';
import type { PagedResult } from '@/types/api';
import type { OrderSummaryDto } from '@/features/orders/types';

export async function GET(request: Request) {
  const user = await getCurrentCustomerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phoneParam = searchParams.get('phone');
  const searchFilter = phoneParam?.trim() || user.phoneNumber || user.email || user.fullName;

  try {
    const result = await apiClient<PagedResult<OrderSummaryDto>>('/admin/orders', {
      params: {
        searchTerm: searchFilter,
        pageSize: 50,
      },
      cache: 'no-store',
    });

    // Ensure only matching customer's records are returned
    const filtered = (result.items || []).filter((order) => {
      const matchesPhone = phoneParam && order.customerPhone.includes(phoneParam);
      const matchesUserPhone = user.phoneNumber && order.customerPhone.includes(user.phoneNumber);
      const matchesName = user.fullName && order.customerFullName.toLowerCase() === user.fullName.toLowerCase();
      return matchesPhone || matchesUserPhone || matchesName || !searchFilter;
    });

    return NextResponse.json({
      items: filtered,
      totalCount: filtered.length,
    });
  } catch {
    return NextResponse.json({ items: [], totalCount: 0 });
  }
}
