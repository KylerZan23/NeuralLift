'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
  {
    variants: {
      variant: {
        primary: 'bg-[#5B8CFF] text-white hover:bg-[#386BFF]',
        secondary: 'bg-white text-[#386BFF] border border-[rgba(13,24,46,0.06)] hover:bg-white/90',
        ghost: 'bg-transparent text-[#386BFF] hover:bg-white/20',
        danger: 'bg-[#EF4444] text-white hover:bg-[#dc2626]'
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-3 text-sm',
        lg: 'px-6 py-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };


