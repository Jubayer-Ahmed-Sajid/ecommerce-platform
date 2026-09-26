'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.loginAdmin({ email: email.trim(), password });
      if (response && response.token) {
        document.cookie = `admin_session=${response.token}; path=/; max-age=86400; SameSite=Lax`;
        try {
          localStorage.setItem('shopbd_admin_user', JSON.stringify(response.user));
        } catch {
          // ignore
        }
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid administrator credentials.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {errorMessage}
        </div>
      )}
      <Input
        label="Email Address"
        type="email"
        placeholder="admin@gmail.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
          Sign In to Console
        </Button>
      </div>
      <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-2">
        Protected by session encryption & role-based security policies.
      </p>
    </form>
  );
}
