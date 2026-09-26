'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth-api';
import type { UserProfile } from '@/features/auth/types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@/lib/firebase/client';
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const profile: UserProfile = {
        id: user.uid,
        fullName: user.displayName || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        phoneNumber: user.phoneNumber || undefined,
        role: 'Customer',
      };

      // Set server-authoritative HttpOnly JWT cookie
      await authApi.syncSession(idToken, profile);

      window.dispatchEvent(new Event('auth-change'));
      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.replace('Firebase: ', '')
          : 'Google sign-in was cancelled or failed.';
      setErrorMessage(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim();

    try {
      if (mode === 'signin') {
        let idToken: string;
        let profile: UserProfile = {
          id: '',
          fullName: 'Customer',
          email: cleanEmail,
          phoneNumber: undefined,
          role: 'Customer',
        };

        try {
          // 1. Authenticate with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const fbUser = userCredential.user;
          idToken = await fbUser.getIdToken();
          profile = {
            id: fbUser.uid,
            fullName: fbUser.displayName || cleanEmail.split('@')[0],
            email: fbUser.email || cleanEmail,
            phoneNumber: fbUser.phoneNumber || undefined,
            role: 'Customer',
          };
        } catch {
          // If user exists in backend legacy seed, fallback to backend API and get JWT
          const legacy = await authApi.loginUser({ email: cleanEmail, password });
          idToken = legacy.token;
          profile = legacy.user;
        }

        // 2. Set server-authoritative HttpOnly JWT cookie
        await authApi.syncSession(idToken, profile);
      } else {
        // Register new account with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCredential.user;

        if (fullName.trim()) {
          await updateProfile(fbUser, { displayName: fullName.trim() });
        }

        const idToken = await fbUser.getIdToken();
        const profile = {
          id: fbUser.uid,
          fullName: fullName.trim() || cleanEmail.split('@')[0],
          email: fbUser.email || cleanEmail,
          phoneNumber: phoneNumber.trim() || undefined,
          role: 'Customer',
        };

        // Set server-authoritative HttpOnly JWT cookie
        await authApi.syncSession(idToken, profile);
      }

      window.dispatchEvent(new Event('auth-change'));
      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.replace('Firebase: ', '')
          : 'Authentication failed. Please verify your details.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-900">
          or continue with email
        </span>
      </div>

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
            {mode === 'signin' ? 'Sign In with Email' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
}
