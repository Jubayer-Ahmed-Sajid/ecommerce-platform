import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors duration-150',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-slate-400 dark:bg-slate-900 dark:placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            error
              ? 'border-rose-400 focus-visible:ring-rose-400 dark:border-rose-600'
              : 'border-slate-300 focus-visible:ring-indigo-500 dark:border-slate-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs font-medium text-rose-500 dark:text-rose-400 animate-fadeIn"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
