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
    <nav className="mb-6 rounded-2xl bg-white/15 text-white shadow-lg ring-1 ring-white/20">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight">NeuralLift</Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-xl px-3 py-2 hover:bg-white/20">Home</Link>
          <Link href="/dashboard" className="rounded-xl px-3 py-2 hover:bg-white/20">Dashboard</Link>
          <Link href={programHref} className="rounded-xl px-3 py-2 hover:bg-white/20">Program</Link>
        </div>
      </div>
    </nav>
  );
}


