import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">
        404
      </span>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Sorry, we could not find the page or product you are looking for. It may have been moved or is no longer available.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Link href="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
          Return to Storefront
        </Link>
        <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'md' })}>
          Browse Products
        </Link>
      </div>
    </div>
  );
}
