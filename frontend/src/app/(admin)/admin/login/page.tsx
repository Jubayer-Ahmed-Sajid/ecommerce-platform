import React from 'react';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLoginForm } from '@/features/auth/components/admin-login-form';

export const metadata: Metadata = {
  title: 'Admin Authentication | ShopBD Console',
  description: 'Authorized store administration login portal.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md shadow-indigo-600/30">
            A
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Enter your credentials to manage products, orders, and store inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
