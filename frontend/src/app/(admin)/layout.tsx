import React from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main id="main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
