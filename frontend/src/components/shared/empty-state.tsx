import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { BoxIcon } from '@/components/ui/icons';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400">
        {icon ?? <BoxIcon size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionText && actionHref && (
        <div className="mt-6">
          <Link href={actionHref} className={buttonVariants({ size: 'sm' })}>
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
}
