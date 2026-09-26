'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log unexpected errors internally for observability
    console.error('Unhandled Client Exception:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        We encountered an unexpected issue while processing your request. Please try again or return to the homepage.
      </p>

      {error.digest && (
        <p className="mt-1 text-xs text-slate-400 font-mono">
          Reference Code: {error.digest}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button onClick={() => reset()} variant="primary" size="md">
          Try Again
        </Button>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          size="md"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
