import React from 'react';
import Link from 'next/link';
import {
  BarChartIcon,
  BoxIcon,
  FolderIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
} from '@/components/ui/icons';

export function AdminSidebar() {
  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChartIcon },
    { href: '/admin/products', label: 'Products', icon: BoxIcon },
    { href: '/admin/categories', label: 'Categories', icon: FolderIcon },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
    { href: '/admin/inventory', label: 'Inventory', icon: TrendingUpIcon },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-screen p-4 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-6">
        {/* Brand / Admin Portal Header */}
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs">
            A
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white">Admin Console</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to storefront link */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <span>←</span>
          <span>View Public Storefront</span>
        </Link>
      </div>
    </aside>
  );
}
