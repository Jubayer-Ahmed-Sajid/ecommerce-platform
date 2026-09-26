import React from 'react';
import type { Metadata } from 'next';
import { adminApi } from '@/features/admin/api/admin-api';
import { StockAdjustModal } from '@/features/admin/components/stock-adjust-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangleIcon } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Inventory & Stock Levels | iStoreBD Console',
};

export default async function AdminInventoryPage() {
  const stockItems = await adminApi.listInventory().catch(() => []);

  const lowStockItems = stockItems.filter(
    (item) => item.availableQuantity <= item.lowStockThreshold && item.availableQuantity > 0
  );
  const outOfStockItems = stockItems.filter((item) => item.availableQuantity <= 0);

  return (
    <div className="space-y-6">
      {/* Low-stock / Out-of-stock Alert Banner */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            <AlertTriangleIcon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Inventory Attention Required
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
              {outOfStockItems.length > 0 && (
                <span className="font-semibold text-rose-700 dark:text-rose-400 mr-2">
                  {outOfStockItems.length} item{outOfStockItems.length > 1 ? 's' : ''} completely out of stock.
                </span>
              )}
              {lowStockItems.length > 0 && (
                <span>
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} at or below threshold.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Header & Adjust Stock Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time authoritative inventory levels, pending order reservations, and audit logs.
          </p>
        </div>

        <div>
          <StockAdjustModal stockItems={stockItems} />
        </div>
      </div>

      {/* Stock Levels Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 p-5 dark:border-slate-800">
          <CardTitle className="text-base">Tracked Stock Items ({stockItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stockItems.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No inventory records found. Create products with variants to initialize stock tracking.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">SKU Identifier</th>
                    <th className="p-4 font-semibold">Product Description</th>
                    <th className="p-4 font-semibold">Variant</th>
                    <th className="p-4 font-semibold text-center">On-Hand Qty</th>
                    <th className="p-4 font-semibold text-center">Reserved Qty</th>
                    <th className="p-4 font-semibold text-center">Available Qty</th>
                    <th className="p-4 font-semibold text-right">Stock Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stockItems.map((item) => {
                    const isLowStock = item.availableQuantity <= item.lowStockThreshold && item.availableQuantity > 0;
                    const isOutOfStock = item.availableQuantity <= 0;

                    return (
                      <tr key={item.variantId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {item.sku}
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          {item.productName}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {item.variantName}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                          {item.currentQuantity}
                        </td>
                        <td className="p-4 text-center font-medium text-amber-600 dark:text-amber-400">
                          {item.reservedQuantity}
                        </td>
                        <td className="p-4 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                          {item.availableQuantity}
                        </td>
                        <td className="p-4 text-right">
                          {isOutOfStock ? (
                            <Badge variant="danger">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning">Low Stock ({item.availableQuantity})</Badge>
                          ) : (
                            <Badge variant="success">Optimal</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
