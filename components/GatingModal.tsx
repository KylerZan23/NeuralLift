'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/lib/ui/dialog';
import { Button } from '@/lib/ui/button';

type Reason = 'unlock_full_program' | 'regenerate_program';
export default function GatingModal({ open, onClose, programId, reason = 'unlock_full_program' }: { open: boolean; onClose: () => void; programId: string; reason?: Reason }) {
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId, mode: 'payment', reason })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reason === 'regenerate_program' ? 'Regenerate your program' : 'Unlock full 12 weeks'}</DialogTitle>
          <DialogDescription>
            {reason === 'unlock_full_program'
              ? 'Week 1 is free. Viewing weeks 2–12 requires a one-time purchase of $9.99.'
              : 'Looks like you’ve gotten stronger — regenerate an updated program to match your new PRs.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Not now</Button>
          <Button onClick={onCheckout} disabled={loading}>
            {loading ? 'Redirecting…' : (reason === 'regenerate_program' ? 'Regenerate — $9.99' : 'Unlock full 12 weeks — $9.99')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


