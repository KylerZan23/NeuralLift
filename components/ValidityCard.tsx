'use client';
import { ReactNode } from 'react';

type Props = { ok: boolean; message?: string; children?: ReactNode };
export default function ValidityCard({ ok, message, children }: Props) {
  return (
    <div className={`rounded-2xl p-6 ${ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
      {children ?? message}
    </div>
  );
}


