'use client';
import * as React from 'react';
import { cn } from '@/lib/utils/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl bg-white shadow-lg border border-gray-200/50', className)} {...props} />
  );
}


