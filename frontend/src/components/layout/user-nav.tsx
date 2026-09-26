'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth-api';
import type { UserProfile } from '@/features/auth/types';

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verify session with backend asynchronously
    authApi
      .getCurrentUser()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem('shopbd_user', JSON.stringify(profile));
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem('shopbd_user');
          setUser(stored ? JSON.parse(stored) : null);
        } catch {
          setUser(null);
        }
      });

    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem('shopbd_user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logoutUser();
    } catch {
      // Proceed with client logout regardless
    } finally {
      localStorage.removeItem('shopbd_user');
      setUser(null);
      setIsOpen(false);
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
      router.refresh();
    }
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5 text-slate-500"
        >
          <path
            fillRule="evenodd"
            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
        <span>Sign In</span>
      </Link>
    );
  }

  const firstName = user.fullName.split(' ')[0] || user.fullName;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline-block max-w-[100px] truncate">{firstName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-3 py-2 text-left dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">
                {user.email}
              </p>
            </div>

            <div className="py-1">
              <Link
                href="/orders/track"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 text-slate-400"
                >
                  <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h9V4.606c0-.771-.582-1.428-1.34-1.49A48.887 48.887 0 006.5 3zM2 12v3.393c0 .772.582 1.429 1.34 1.49 1.032.077 2.074.117 3.125.117s2.093-.04 3.125-.117a1.49 1.49 0 001.34-1.49V12H2z" />
                </svg>
                Track Orders
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
