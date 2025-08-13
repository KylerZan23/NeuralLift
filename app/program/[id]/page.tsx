'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ProgramWeekView, { Day } from '@/components/ProgramWeekView';
import GatingModal from '@/components/GatingModal';
import TopNav from '@/components/TopNav';

type Program = {
  program_id: string;
  name: string;
  paid: boolean;
  weeks: { week_number: number; days: Day[] }[];
};

export default function ProgramPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [showGating, setShowGating] = useState<boolean>(false);
  const search = useSearchParams();
  const [showToast, setShowToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    fetch(`/api/program/${id}`, { method: 'GET' })
      .then(r => r.json())
      .then((p) => setProgram(p))
      .catch(() => setProgram(null))
      .finally(() => setLoading(false));
  }, [params.id, search?.get('checkout')]);

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
    return;
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white">
      <TopNav programId={program.program_id} />
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">{program.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGating(true)}
              className="rounded-xl bg-white text-gray-900 px-4 py-2 font-semibold"
            >
              Unlock full 12 weeks — $9.99
            </button>
            <button
              onClick={() => setShowGating(true)}
              className="rounded-xl border border-white/40 px-4 py-2"
              title="Regenerate a program updated to your current PRs"
            >
              Generate a new program
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => handleWeekSelect(w)}
              className={`rounded-full px-3 py-1 text-sm ${selectedWeek === w ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30'}`}
            >
              Week {w}
            </button>
          ))}
        </div>

        <ProgramWeekView
          weekNumber={selectedWeek}
          days={program.weeks.find(w => w.week_number === selectedWeek)?.days ?? []}
        />
      </div>

      <GatingModal open={showGating} onClose={() => setShowGating(false)} programId={program.program_id} reason={selectedWeek > 1 ? 'unlock_full_program' : 'regenerate_program'} />

      {showToast ? (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
          <div className="rounded-xl bg-white text-gray-900 px-4 py-3 shadow-xl">
            Purchase successful — all weeks unlocked.
          </div>
        </div>
      ) : null}
    </main>
  );
}


