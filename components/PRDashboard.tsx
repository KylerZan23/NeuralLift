'use client';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/integrations/supabase';
import { fetchLatestProgramIdForUser } from '@/lib/programs';
import Sparkline from './Sparkline';
import { Label } from '@/lib/ui/label';
import { Input } from '@/lib/ui/input';
import { Button } from '@/lib/ui/button';

export default function PRDashboard() {
  const [bench, setBench] = useState<number | ''>('');
  const [squat, setSquat] = useState<number | ''>('');
  const [deadlift, setDeadlift] = useState<number | ''>('');
  const [series, setSeries] = useState<{ bench: number[]; squat: number[]; deadlift: number[] }>({ bench: [], squat: [], deadlift: [] });
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [showUpsell, setShowUpsell] = useState<boolean>(false);
  const IMPROVEMENT_THRESHOLD = 0.05; // 5%
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    // Load current PRs, or pending PRs if user is not signed in
    (async () => {
      try {
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (!uid) {
          try {
            const raw = localStorage.getItem('pending_prs');
            if (raw) {
              const pending = JSON.parse(raw);
              setBench(pending.bench ?? '');
              setSquat(pending.squat ?? '');
              setDeadlift(pending.deadlift ?? '');
            }
          } catch {}
          return;
        }
        // Load latest program id for user to support regenerate flow
        const pid = await fetchLatestProgramIdForUser(supabase, uid);
        if (pid) setActiveProgramId(pid);
        const { data: row } = await supabase.from('prs').select('*').eq('user_id', uid).single();
        if (row) {
          setBench(row.bench ?? '');
          setSquat(row.squat ?? '');
          setDeadlift(row.deadlift ?? '');
        }
      } catch {}
    })();
  }, []);

  const onSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/pr/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bench: Number(bench || 0), squat: Number(squat || 0), deadlift: Number(deadlift || 0) })
      });
      if (!res.ok) throw new Error('Failed to save');
      setSeries(prev => ({
        bench: [...prev.bench, Number(bench || 0)].filter(Boolean).slice(-20),
        squat: [...prev.squat, Number(squat || 0)].filter(Boolean).slice(-20),
        deadlift: [...prev.deadlift, Number(deadlift || 0)].filter(Boolean).slice(-20)
      }));
      // Trigger upsell if any of the lifts improves by >=5% vs prior entry
      const latest = { bench: Number(bench || 0), squat: Number(squat || 0), deadlift: Number(deadlift || 0) };
      const prior = {
        bench: series.bench[series.bench.length - 1] ?? latest.bench,
        squat: series.squat[series.squat.length - 1] ?? latest.squat,
        deadlift: series.deadlift[series.deadlift.length - 1] ?? latest.deadlift
      };
      const improved = (key: 'bench' | 'squat' | 'deadlift') => prior[key] > 0 && latest[key] >= prior[key] * (1 + IMPROVEMENT_THRESHOLD);
      if (improved('bench') || improved('squat') || improved('deadlift')) {
        setShowUpsell(true);
      }
      try { localStorage.removeItem('pending_prs'); } catch {}
    } catch {
      // no-op UI for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl bg-white p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-gray-900">Your PRs</h3>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex flex-col text-sm text-gray-700">
          <Label htmlFor="bench">Bench (lb)</Label>
          <Input id="bench" className="mt-1" type="number" value={bench} onChange={e => setBench(Number(e.target.value))} />
          <div className="mt-2"><Sparkline values={series.bench} userId={userId} metric="bench" /></div>
        </div>
        <div className="flex flex-col text-sm text-gray-700">
          <Label htmlFor="squat">Squat (lb)</Label>
          <Input id="squat" className="mt-1" type="number" value={squat} onChange={e => setSquat(Number(e.target.value))} />
          <div className="mt-2"><Sparkline values={series.squat} stroke="#10B981" userId={userId} metric="squat" /></div>
        </div>
        <div className="flex flex-col text-sm text-gray-700">
          <Label htmlFor="deadlift">Deadlift (lb)</Label>
          <Input id="deadlift" className="mt-1" type="number" value={deadlift} onChange={e => setDeadlift(Number(e.target.value))} />
          <div className="mt-2"><Sparkline values={series.deadlift} stroke="#F59E0B" userId={userId} metric="deadlift" /></div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} disabled={!userId || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      </div>
      {showUpsell ? (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-gray-900">
          <h3 className="text-xl font-bold">You’re getting stronger!</h3>
          <p className="mt-2 text-gray-700">Regenerate an up-to-date program that matches your new PRs.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="rounded-xl px-4 py-2 border border-gray-300" onClick={() => setShowUpsell(false)}>Not now</button>
            <button
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700"
              onClick={async () => {
                setShowUpsell(false);
                try {
                  if (!activeProgramId) return;
                  const res = await fetch('/api/stripe-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ programId: activeProgramId, reason: 'regenerate_program' })
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch {}
              }}
            >Regenerate — $9.99</button>
          </div>
        </div>
      </div>
      ) : null}
    </>
  );
}


