'use client';
import { ReactNode } from 'react';

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl ${className ?? ''}`}>
      {children}
    </div>
  );
}


