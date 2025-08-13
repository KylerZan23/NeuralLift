'use client';
import { Fragment, useMemo } from 'react';
import { computeSuggestedWorkingWeight, computeSuggestedWorkingWeightRange, type Big3PRs, type ExperienceLevel } from '@/lib/weight-prescription';

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  tempo: string;
  rest_seconds: number;
  intensity_pct?: number;
};

export type Day = {
  day_number: number;
  focus: string;
  exercises: Exercise[];
  notes?: string;
};

export default function ProgramWeekView({ weekNumber, days, prs, experience }: { weekNumber: number; days: Day[]; prs?: Big3PRs; experience?: ExperienceLevel }) {
  return (
    <section aria-label={`Week ${weekNumber}`} className="rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900">Week {weekNumber}</h3>
      <div className="mt-4 grid md:grid-cols-2 gap-6">
        {days.map(day => (
          <div key={day.day_number} className="rounded-xl border border-border/50 p-4 bg-card/50 backdrop-blur-sm">
            <h4 className="text-lg font-semibold text-gray-900">Day {day.day_number} — {day.focus}</h4>
            <ul className="mt-3 space-y-2">
              {day.exercises.map(ex => (
                <li key={ex.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-3">
                  <div>
                    <div className="font-medium text-foreground">{ex.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ex.sets} sets × {ex.reps} reps · RPE {ex.rpe} · Tempo {ex.tempo} · Rest {Math.round((ex.rest_seconds ?? 0) / 60)}m
                      {ex.intensity_pct != null ? <> · {Math.round(ex.intensity_pct * 100)}%</> : null}
                    </div>
                    <SuggestedWeight name={ex.name} prs={prs} experience={experience} />
                  </div>
                </li>
              ))}
            </ul>
            {day.notes ? <p className="mt-3 text-sm text-muted-foreground">{day.notes}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function SuggestedWeight({ name, prs, experience }: { name: string; prs?: Big3PRs; experience?: ExperienceLevel }) {
  const range = useMemo(() => {
    if (!prs) return null;
    return computeSuggestedWorkingWeightRange(name, prs, experience ?? 'Intermediate');
  }, [name, prs, experience]);
  if (range == null) return null;
  return (
    <div className="mt-1 text-sm text-indigo-700">
      Suggested: {range.low}–{range.high} lb
      {range.perHand ? (
        <span className="ml-1 cursor-help" title="Per-hand load. Use this weight in each hand for dumbbell movements.">ⓘ</span>
      ) : null}
    </div>
  );
}


