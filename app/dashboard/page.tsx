'use client';
import PRDashboard from '@/components/PRDashboard';
import ValidityCard from '@/components/ValidityCard';
import { useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchLatestProgramIdForUser } from '@/lib/programs';

export default function DashboardPage() {
  const onGenerateNew = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      const programId = await fetchLatestProgramIdForUser(supabase, userId);
      if (!programId) return;
      const res = await fetch('/api/stripe-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ programId, reason: 'regenerate_program', userId }) });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch {}
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <button onClick={onGenerateNew} className="rounded-xl bg-white text-gray-900 px-4 py-2 font-semibold">Generate a new program</button>
        </div>
        <PRDashboard />
        <div>
          <h2 className="text-2xl font-bold">Validity</h2>
          <div className="mt-2">
            <ValidityCard ok={true} message={
              'This 12-week hypertrophy plan follows a 3:1 accumulation/deload cycle, targets 14–18 effective sets per muscle (Intermediate), and prioritizes compound-first exercise order with evidence-based rep ranges. Sources: Jeff Nippard, TNF, Dr. Mike Israetel.'
            } />
          </div>
        </div>
      </div>
    </main>
  );
}


