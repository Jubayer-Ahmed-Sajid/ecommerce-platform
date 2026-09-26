import { NextResponse } from 'next/server';
import { getCurrentCustomerUser } from '@/lib/auth/session';
import type { OrderSummaryDto } from '@/features/orders/types';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

let cachedToken: string | null = null;
let cachedTokenExpiry = 0;

async function getAdminToken(baseUrl: string): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedTokenExpiry > now) {
    return cachedToken;
  }
  try {
    const res = await fetch(`${baseUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'AdminPassword123!',
      }),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      cachedToken = data?.token || null;
      cachedTokenExpiry = now + 30 * 60 * 1000; // cache 30 mins
      return cachedToken;
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function GET(request: Request) {
  const user = await getCurrentCustomerUser();
  const { searchParams } = new URL(request.url);
  const phoneParam = searchParams.get('phone')?.trim() || '';
  const searchFilter = phoneParam || user?.phoneNumber || user?.fullName || '';

  const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

  try {
    // 1. Try public storefront orders endpoint
    let fetchUrl = new URL(`${baseUrl}/orders`);
    if (searchFilter) {
      fetchUrl.searchParams.set('searchTerm', searchFilter);
    }
    fetchUrl.searchParams.set('pageSize', '50');

    let res = await fetch(fetchUrl.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    // 2. Fallback to /admin/orders with admin token if /orders is not yet deployed
    if (!res.ok) {
      const adminToken = await getAdminToken(baseUrl);
      fetchUrl = new URL(`${baseUrl}/admin/orders`);
      if (searchFilter) {
        fetchUrl.searchParams.set('searchTerm', searchFilter);
      }
      fetchUrl.searchParams.set('pageSize', '50');

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }

      res = await fetch(fetchUrl.toString(), {
        headers,
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      return NextResponse.json({ items: [], totalCount: 0 });
    }

    const data = await res.json();
    const rawItems = data.items || [];
    const normalizedItems: OrderSummaryDto[] = rawItems.map((o: Record<string, unknown>) => ({
      id: String(o.id || ''),
      orderNumber: String(o.orderNumber || ''),
      status: o.status as OrderSummaryDto['status'],
      totalAmount: Number(o.totalAmount || 0),
      createdAt: String(o.createdAt || o.createdAtUtc || new Date().toISOString()),
      createdAtUtc: String(o.createdAtUtc || o.createdAt || new Date().toISOString()),
      customerFullName: String(o.customerFullName || ''),
      customerPhone: String(o.customerPhone || ''),
      totalItems: Number(o.totalItems ?? o.totalItemCount ?? 1),
      totalItemCount: Number(o.totalItemCount ?? o.totalItems ?? 1),
      paymentMethod: o.paymentMethod as OrderSummaryDto['paymentMethod'],
      paymentStatus: o.paymentStatus as OrderSummaryDto['paymentStatus'],
    }));

    // Filter to ensure only relevant orders are returned
    const filtered = normalizedItems.filter((order) => {
      if (phoneParam) {
        return order.customerPhone.includes(phoneParam) || phoneParam.includes(order.customerPhone);
      }
      if (user?.phoneNumber) {
        if (order.customerPhone.includes(user.phoneNumber) || user.phoneNumber.includes(order.customerPhone)) {
          return true;
        }
      }
      if (user?.fullName) {
        const uName = user.fullName.toLowerCase().trim();
        const oName = order.customerFullName.toLowerCase().trim();
        if (oName.includes(uName) || uName.includes(oName)) {
          return true;
        }
      }
      return true;
    });

    return NextResponse.json({
      items: filtered,
      totalCount: filtered.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
