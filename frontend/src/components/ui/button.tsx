import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const buttonBaseStyles =
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none rounded-lg';

export const buttonVariantsMap = {
  primary:
    'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] focus-visible:ring-indigo-500',
  secondary:
    'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98] focus-visible:ring-slate-400',
  outline:
    'border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger:
    'bg-rose-600 text-white shadow-md hover:bg-rose-700 active:scale-[0.98] focus-visible:ring-rose-500',
};

export const buttonSizesMap = {
  sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
  md: 'text-sm px-4 py-2 h-10 gap-2',
  lg: 'text-base px-6 py-3 h-12 gap-2.5',
};

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} = {}): string {
  return cn(buttonBaseStyles, buttonVariantsMap[variant], buttonSizesMap[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
