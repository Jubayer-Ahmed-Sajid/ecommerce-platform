import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserLoginForm } from '@/features/auth/components/user-login-form';

export const metadata: Metadata = {
  title: 'Customer Sign In | ShopBD',
  description: 'Sign in to your customer account or register for faster checkout and order tracking.',
};

export default function UserLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-1.5 text-center pb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md shadow-indigo-600/30">
            E
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ShopBD</CardTitle>
          <CardDescription>
            Sign in to track orders, save shipping info, and enjoy fast checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading form...</div>}>
            <UserLoginForm />
          </Suspense>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>Are you a store manager? </span>
            <Link
              href="/admin/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Merchant Console
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
