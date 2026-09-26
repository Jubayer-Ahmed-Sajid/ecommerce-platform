'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function UserLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('user@gmail.com');
  const [password, setPassword] = useState('UserPassword123!');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'signin') {
        const response = await authApi.loginUser({
          email: email.trim(),
          password,
        });
        localStorage.setItem('shopbd_user', JSON.stringify(response.user));
      } else {
        const response = await authApi.registerUser({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
        });
        localStorage.setItem('shopbd_user', JSON.stringify(response.user));
      }

      window.dispatchEvent(new Event('auth-change'));
      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your details.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMessage(null);
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === 'signin'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMessage(null);
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Tanvir Ahmed"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Mobile Number (Optional)"
              type="tel"
              placeholder="017XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="yourname@gmail.com"
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

        {mode === 'signin' && (
          <div className="rounded-lg bg-indigo-50/70 p-3 text-[11px] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="font-bold">Demo Customer Credentials:</span>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-slate-600 dark:text-slate-400">
              <span>Email: <strong className="text-slate-900 dark:text-white">user@gmail.com</strong></span>
              <span>Pass: <strong className="text-slate-900 dark:text-white">UserPassword123!</strong></span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md shadow-indigo-600/20"
            isLoading={isLoading}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
}
