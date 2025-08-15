'use client';
import * as React from 'react';
import { cn } from '@/lib/utils/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-[rgba(13,24,46,0.12)] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';
export { Input };


