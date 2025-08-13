'use client';
import { Fragment } from 'react';

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

export default function ProgramWeekView({ weekNumber, days }: { weekNumber: number; days: Day[] }) {
  return (
    <section aria-label={`Week ${weekNumber}`} className="rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900">Week {weekNumber}</h3>
      <div className="mt-4 grid md:grid-cols-2 gap-6">
        {days.map(day => (
          <div key={day.day_number} className="rounded-2xl border border-gray-200 p-4 bg-white">
            <h4 className="text-lg font-semibold text-gray-900">Day {day.day_number} — {day.focus}</h4>
            <ul className="mt-3 space-y-2">
              {day.exercises.map(ex => (
                <li key={ex.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-3">
                  <div>
                    <div className="font-medium text-gray-900">{ex.name}</div>
                    <div className="text-sm text-gray-600">
                      {ex.sets} sets × {ex.reps} reps · RPE {ex.rpe} · Tempo {ex.tempo} · Rest {ex.rest_seconds}s
                      {ex.intensity_pct != null ? <> · {Math.round(ex.intensity_pct * 100)}%</> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {day.notes ? <p className="mt-3 text-sm text-gray-700">{day.notes}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}


