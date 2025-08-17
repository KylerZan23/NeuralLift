'use client';
import { useMemo } from 'react';
import { computeSuggestedWorkingWeightRange, type Big3PRs, type ExperienceLevel } from '@/lib/core/weight-prescription';
import { cn } from '@/lib/utils/utils';
import type { Day } from '@/types/program';

type WeightOverride = { low: number; high: number; perHand?: boolean } | null;

export default function ProgramWeekView({ weekNumber, days, prs, experience, singleColumn, twoColumnExercises = false, suggestedWeightOverrides }: { weekNumber: number; days: Day[]; prs?: Big3PRs | null; experience?: ExperienceLevel; singleColumn?: boolean; twoColumnExercises?: boolean; exerciseSplitLeftCount?: number; suggestedWeightOverrides?: Record<string, WeightOverride> }) {
  return (
    <section aria-label={`Week ${weekNumber}`} className="rounded-2xl bg-white/80 backdrop-blur-md p-4 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900">Week {weekNumber}</h3>
      <div className={cn('mt-3 grid gap-4', singleColumn ? 'grid-cols-1' : 'md:grid-cols-2')}>
        {days.map(day => (
          <div key={day.day_number} className="rounded-lg border border-border/50 p-3 bg-card/50 backdrop-blur-sm">
            <h4 className="text-base font-semibold text-gray-900">Day {day.day_number} — {day.focus}</h4>
            {twoColumnExercises ? (
              (() => {
                const items = day.exercises;
                // If 4 or fewer, show single column only
                if (items.length <= 4) {
                  return (
                    <ul className="mt-2 space-y-1.5">
                      {items.map(ex => (
                        <li key={ex.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-2">
                          <div>
                            <div className="font-medium text-foreground">{ex.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {ex.sets} sets × {ex.reps} reps · RIR 0-1 · Rest {Math.round((ex.rest_seconds ?? 0) / 60)}m
                            </div>
                            <SuggestedWeight name={ex.name} prs={prs} experience={experience} overrides={suggestedWeightOverrides} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Otherwise, render in rows, each with up to 4 left and up to 4 right
                const rows: { left: typeof items; right: typeof items }[] = [];
                for (let i = 0; i < items.length; i += 8) {
                  const left = items.slice(i, i + 4);
                  const right = items.slice(i + 4, i + 8);
                  rows.push({ left, right });
                }

                return (
                  <div className="mt-2 space-y-2">
                    {rows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ul className="space-y-1.5">
                          {row.left.map(ex => (
                            <li key={ex.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-2">
                              <div>
                                <div className="font-medium text-foreground">{ex.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {ex.sets} sets × {ex.reps} reps · RIR 0-1 · Rest {Math.round((ex.rest_seconds ?? 0) / 60)}m
                                </div>
                                <SuggestedWeight name={ex.name} prs={prs} experience={experience} overrides={suggestedWeightOverrides} />
                              </div>
                            </li>
                          ))}
                        </ul>
                        <ul className="space-y-1.5">
                          {row.right.map(ex => (
                            <li key={ex.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-2">
                              <div>
                                <div className="font-medium text-foreground">{ex.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {ex.sets} sets × {ex.reps} reps · RIR 0-1 · Rest {Math.round((ex.rest_seconds ?? 0) / 60)}m
                                </div>
                                <SuggestedWeight name={ex.name} prs={prs} experience={experience} overrides={suggestedWeightOverrides} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <ul className="mt-2 space-y-1.5">
                {day.exercises.map(ex => (
                  <li key={ex.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-2">
                    <div>
                      <div className="font-medium text-foreground">{ex.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {ex.sets} sets × {ex.reps} reps · RIR 0-1 · Rest {Math.round((ex.rest_seconds ?? 0) / 60)}m
                      </div>
                      <SuggestedWeight name={ex.name} prs={prs} experience={experience} overrides={suggestedWeightOverrides} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {day.notes ? <p className="mt-3 text-sm text-muted-foreground">{day.notes}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function SuggestedWeight({ name, prs, experience, overrides }: { name: string; prs?: Big3PRs | null | undefined; experience?: ExperienceLevel | undefined; overrides?: Record<string, WeightOverride> | undefined }) {
  const range = useMemo(() => {
    const o = overrides?.[name];
    if (o === null) return null;
    if (o) return { low: o.low, high: o.high, perHand: o.perHand ?? /dumbbell|db|each/i.test(name) };
    if (!prs) return null;
    return computeSuggestedWorkingWeightRange(name, prs, experience ?? 'Intermediate');
  }, [name, prs, experience, overrides]);
  
  const isMachineExercise = /leg\s+extension|leg\s+curl|lying\s+leg\s+curl|hamstring\s+curl|lat\s+pulldown|leg\s+press|seated\s+calf\s+raise|cable|machine|smith/i.test(name);
  
  if (range == null) {
    // Show machine message even when no weight suggestion available
    if (isMachineExercise) {
      return (
        <div className="mt-1 text-xs text-gray-500">
          <span className="cursor-help" title="Weight dependent on machine type">Weight dependent on machine type ⓘ</span>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="mt-1 text-xs text-indigo-700">
      Suggested: {range.low}–{range.high} lb
      {range.perHand ? (
        <span className="ml-1 cursor-help" title="Per-hand load. Use this weight in each hand for dumbbell movements.">ⓘ</span>
      ) : isMachineExercise ? (
        <span className="ml-1 cursor-help" title="Weight dependent on machine type">ⓘ</span>
      ) : null}
    </div>
  );
}