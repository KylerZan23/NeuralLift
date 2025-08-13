'use client';
import { useEffect, useRef, useState } from 'react';

type Reason = 'unlock_full_program' | 'regenerate_program';
export default function GatingModal({ open, onClose, programId, reason = 'unlock_full_program' }: { open: boolean; onClose: () => void; programId: string; reason?: Reason }) {
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const focusables = getFocusable(dialogRef.current);
    if (focusables.length > 0) focusables[0].focus();
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    onClose();
    if (previouslyFocused.current) {
      try { previouslyFocused.current.focus(); } catch {}
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(dialogRef.current);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId, mode: 'payment', reason }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 grid place-items-center bg-black/50 p-6"
      onKeyDown={onKeyDown}
    >
      <div ref={dialogRef} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-gray-900" aria-labelledby="modal-title">
        <h3 id="modal-title" className="text-xl font-bold">{reason === 'regenerate_program' ? 'Regenerate your program' : 'Unlock full 12 weeks'}</h3>
        {reason === 'unlock_full_program' ? (
          <p className="mt-2 text-gray-700">Week 1 is free. Viewing weeks 2–12 requires a one-time purchase of $9.99.</p>
        ) : (
          <p className="mt-2 text-gray-700">Looks like you’ve gotten stronger — regenerate an updated program to match your new PRs.</p>
        )}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={handleClose} className="rounded-xl px-4 py-2 border border-gray-300">Not now</button>
          <button
            onClick={onCheckout}
            disabled={loading}
            className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Redirecting…' : (reason === 'regenerate_program' ? 'Regenerate — $9.99' : 'Unlock full 12 weeks — $9.99')}
          </button>
        </div>
      </div>
    </div>
  );
}

function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')));
}


