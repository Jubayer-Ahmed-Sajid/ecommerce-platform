'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; max-age=0; SameSite=Lax';
    try {
      localStorage.removeItem('shopbd_admin_user');
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Store Management Console
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Live Store
        </span>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          admin@gmail.com
        </span>
        <button
          onClick={handleLogout}
          type="button"
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
