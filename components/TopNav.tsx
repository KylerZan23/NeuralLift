'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchLatestProgramIdForUser } from '@/lib/programs';

type Props = {
  programId?: string | null;
};

export default function TopNav({ programId }: Props) {
  const [latestProgramId, setLatestProgramId] = useState<string | null>(programId ?? null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (programId) return; // prefer provided id
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getUser();
        const id = await fetchLatestProgramIdForUser(supabase, data.user?.id);
        if (mounted) setLatestProgramId(id);
      } catch {}
    }
    run();
    return () => { mounted = false; };
  }, [programId]);

  const programHref = latestProgramId ? `/program/${latestProgramId}` : '/dashboard';

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 text-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-2xl">NeuralLift</Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link href={programHref} className="text-muted-foreground hover:text-foreground transition-colors">Program</Link>
        </div>
      </div>
    </nav>
  );
}


