import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full rounded border bg-surface-lowest px-3 text-sm text-on-surface',
        'focus:outline-none focus:ring-2 focus:ring-primary-container/40',
        hasError
          ? 'border-error focus:border-error'
          : 'border-outline-variant focus:border-primary-container',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';
