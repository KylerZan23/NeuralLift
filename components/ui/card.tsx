'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl bg-white/70 backdrop-blur-xl shadow-xl', className)} {...props} />
  );
}


