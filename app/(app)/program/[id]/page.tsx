 'use client';
 import { useEffect, useState } from 'react';
 import { useParams, useSearchParams, useRouter } from 'next/navigation';
 import ProgramWeekView from '@/components/ProgramWeekView';
 import { getSupabaseClient } from '@/lib/integrations/supabase';
 import type { Big3PRs } from '@/lib/core/weight-prescription';
 import GatingModal from '@/components/GatingModal';
 import TopNav from '@/components/TopNav';
 import { Button } from '@/lib/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/ui/tabs';
import type { Program as ProgramType } from '@/types/program';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

 type Program = ProgramType;

 function isProgram(payload: unknown): payload is Program {
   const p = payload as Program;
   return (
     p != null &&
     typeof p === 'object' &&
     typeof p.program_id === 'string' &&
     typeof p.name === 'string' &&
     Array.isArray(p.weeks)
   );
 }

export default function ProgramPage() {
  const { pendingPRs } = useOnboardingStore();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [showGating, setShowGating] = useState<boolean>(false);
  const search = useSearchParams();
  const [showToast, setShowToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [prs, setPrs] = useState<Big3PRs | null>(null);
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    fetch(`/api/program/${id}`, { method: 'GET' })
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (!r.ok || !isProgram(body)) {
          throw new Error('Failed to load program');
        }
        return body as Program;
      })
      .then((p) => {
        setProgram(p);
        const meta = p.metadata as { big3_prs?: Big3PRs, experience_level?: 'Beginner' | 'Intermediate' | 'Advanced' } | undefined;
        if (meta?.big3_prs) setPrs(meta.big3_prs);
        if (meta?.experience_level) setExperience(meta.experience_level);
      })
      .catch(() => setProgram(null))
      .finally(() => setLoading(false));
  }, [params.id, search]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const { data: row } = await supabase.from('prs').select('*').eq('user_id', uid).single();
        if (row) setPrs({ bench: row.bench ?? null, squat: row.squat ?? null, deadlift: row.deadlift ?? null });
      } catch {}
    })();
  }, []);
  
  // Fallback: if no PRs in supabase, check pendingPRs in Zustand store
  useEffect(() => {
    if (prs && (prs.bench || prs.squat || prs.deadlift)) return;
    if (pendingPRs.bench || pendingPRs.squat || pendingPRs.deadlift) {
      setPrs({
        bench: pendingPRs.bench ?? null,
        squat: pendingPRs.squat ?? null,
        deadlift: pendingPRs.deadlift ?? null
      });
    }
  }, [prs, pendingPRs]);

  // Post-payment toast & cleanup of query param
  useEffect(() => {
    const status = search?.get('checkout');
    if (status === 'success') {
      setShowToast(true);
      const timeout = setTimeout(() => setShowToast(false), 3500);
      // Remove query param without full navigation
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      const url = `/program/${id}`;
      router.replace(url);
      return () => clearTimeout(timeout);
    }
  }, [search, router, params.id]);

  if (loading) return <div className="min-h-screen grid place-items-center text-white/90">Loading program…</div>;
  if (!program) return <div className="min-h-screen grid place-items-center text-white/90">Program not found</div>;

  const handleWeekSelect = (w: number) => {
    if (w > 1 && !program.paid) {
      setShowGating(true);
      return;
    }
    setSelectedWeek(w);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.985_0.015_240)] via-card to-[oklch(0.985_0.01_240)] text-foreground">
      <TopNav programId={program.program_id} />
      <section className="pt-20 pb-10 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex items-center justify-between">
            <h1 className="font-display text-3xl md:text-4xl">{program.name}</h1>
            <div className="flex gap-2">
              <Button onClick={() => setShowGating(true)}>Unlock full 12 weeks — $9.99</Button>
              <Button variant="outline" onClick={() => setShowGating(true)} title="Regenerate a program updated to your current PRs">Generate a new program</Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative z-10">
              <div className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl">Weekly Overview</h2>
                </div>
                <Tabs value={String(selectedWeek)} onValueChange={(val) => handleWeekSelect(Number(val))}>
                  <TabsList className="flex flex-wrap gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                      <TabsTrigger
                        key={w}
                        value={String(w)}
                        className={`rounded-md px-3 py-1 text-sm ${selectedWeek === w ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                      >
                        Week {w}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                    <TabsContent key={w} value={String(w)}>
                      <ProgramWeekView
                        weekNumber={w}
                        days={program?.weeks?.find(week => week.week_number === w)?.days ?? []}
                        prs={prs ?? undefined}
                        experience={experience}
                        singleColumn
                        twoColumnExercises
                        exerciseSplitLeftCount={4}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      <GatingModal open={showGating} onClose={() => setShowGating(false)} programId={program.program_id} reason={selectedWeek > 1 ? 'unlock_full_program' : 'regenerate_program'} />

      {showToast ? (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
          <div className="rounded-xl bg-card text-foreground px-4 py-3 shadow-xl border border-border/50">
            Purchase successful — all weeks unlocked.
          </div>
        </div>
      ) : null}
    </main>
  );
}


