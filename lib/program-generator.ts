import { z } from 'zod';
import Ajv from 'ajv';
import programSchema from '@/types/program.schema.json';
import type { Program } from '@/types/program';

export const OnboardingInput = z.object({
  id: z.string().optional(),
  age: z.number().optional(),
  sex: z.enum(['male', 'female']).optional(),
  BW: z.number().optional(),
  experience_level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  training_frequency_preference: z.number().int().min(2).max(6),
  equipment_available: z.array(z.string()).default([]),
  goals: z.array(z.string()).default(['hypertrophy']),
  big3_PRs: z.object({ bench: z.number().optional(), squat: z.number().optional(), deadlift: z.number().optional() }),
  injuries: z.array(z.string()).default([]),
  movement_preferences: z.array(z.string()).default([]),
  preferred_split: z.enum(['Push/Pull/Legs', 'Upper/Lower', 'Full body', 'Custom']).optional(),
  focus_point: z.enum(['Arms', 'Chest', 'Back', 'Quads', 'Glutes', 'Delts']).optional(),
  session_length_min: z.number().int().min(30).max(120).default(60),
  rest_pref: z.enum(['auto', 'custom']).default('auto'),
  nutrition: z.enum(['deficit', 'surplus', 'maintenance']).default('maintenance')
});

export type OnboardingInput = z.infer<typeof OnboardingInput>;

type Exercise = {
  id: string; name: string; sets: number; reps: string; rpe: number; tempo: string; rest_seconds: number; intensity_pct?: number;
};

const ajv = new Ajv({ allErrors: true, strict: false });
const validateProgram = ajv.compile(programSchema as any);

function coerceProgramId(p: any, programId: string): any {
  if (!p || typeof p !== 'object') return p;
  p.program_id = programId;
  return p;
}

function ensureMetadata(p: any): any {
  const created = new Date().toISOString();
  const defaults = {
    created_at: created,
    source: ['Schoenfeld et al.', 'Nuckols', 'Jeff Nippard', 'Mike Israetel'],
    volume_profile: {}
  };
  p.metadata = { ...defaults, ...(p.metadata ?? {}) };
  p.paid = Boolean(p.paid ?? false);
  return p;
}

function toProgramOrThrow(p: any): Program {
  const ok = validateProgram(p);
  if (!ok) {
    const errs = JSON.stringify(validateProgram.errors ?? []);
    throw new Error(`Program failed schema validation: ${errs}`);
  }
  return p as Program;
}

async function repairWithModel(raw: string, errors: any[]): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' as any },
      messages: [
        { role: 'system', content: 'You return strictly valid JSON matching the provided schema. No prose.' },
        { role: 'user', content: `Fix this program JSON to pass the schema. Only return corrected JSON.\nErrors:\n${JSON.stringify(errors)}\nJSON:\n${raw}` }
      ]
    } as any);
    const text = (response as any).choices?.[0]?.message?.content;
    return text ?? null;
  } catch {
    return null;
  }
}

function buildUserProfile(input: OnboardingInput): string {
  const goals = (input.goals ?? []).join(', ');
  const eq = (input.equipment_available ?? []).join(', ');
  const prefs = (input.movement_preferences ?? []).join(', ');
  const inj = (input.injuries ?? []).join(', ');
  const pr = input.big3_PRs ?? {};
  const focus = input.focus_point ? `Focus: ${input.focus_point}.` : '';
  return [
    `Experience: ${input.experience_level}.`,
    `Training days/week: ${input.training_frequency_preference}.`,
    `Session length: ${input.session_length_min} min.`,
    `Goals: ${goals || 'hypertrophy'}.`,
    `Equipment: ${eq || 'Gym'}.`,
    `Preferred split: ${input.preferred_split ?? 'auto'}.`,
    `Rest preference: ${input.rest_pref}.`,
    `Nutrition: ${input.nutrition}.`,
    `PRs (lbs): bench=${(pr as any).bench ?? 'n/a'}, squat=${(pr as any).squat ?? 'n/a'}, deadlift=${(pr as any).deadlift ?? 'n/a'}.`,
    `Injuries: ${inj || 'none'}.`,
    `Movement prefs: ${prefs || 'none'}.`,
    focus
  ].join(' ');
}

const systemPrompt = `
You are an evidence-based strength coach. Generate a 12-week program as strict JSON conforming to the given schema fields and constraints below. Return JSON only.

Constraints (must follow):
- 12 weeks total; each week has 2–6 days based on user.training_frequency_preference.
- Exercise ordering: compounds first, then compound variations, then accessories.
- Weekly effective sets per muscle by experience:
  Beginner: 10–14; Intermediate: 14–18; Advanced: 18–26. Stay within ranges.
- Rep ranges: main lifts 6–12 (emphasis 8–12); accessories 8–20.
- Deload: 3:1 accumulation-to-deload cycle. Deload week reduces sets (~40%) and intensity.
  - RPE range 5–10. Sets 1–8. Intensity_pct 0.4–0.9 when applicable.
  - Rest_seconds rules (strict):
    • Main compound lifts (e.g., Barbell Bench Press, Barbell Back Squat, Standing Overhead Press, Conventional Deadlift) use 180 seconds.
    • Accessories use 120–180 seconds (prefer 120).
  - Session length dictates number of exercises per day (strict): 30 min → 4, 45 min → 5, 60 min → 6, 90 min → 7.
- Tailor exercise selection to equipment, injuries, and movement prefs. Prefer barbell/dumbbell/cable basics; avoid risky variants where injuries conflict.
- Personalize split based on days/week: 2=Full Body; 3=Upper/Lower/Full; 4=Upper/Lower/Upper/Lower; 5=Push/Pull/Legs/Upper/Lower; 6=Push/Pull/Legs/Upper/Lower/Focus.
- Provide notes sparingly for technique/progression. Use consistent tempo strings and RPE guidance.
- Populate metadata.created_at, metadata.source (strings, e.g., research/authors), metadata.volume_profile (per muscle weekly set counts as integers).

Methodology:
- Ground decisions in modern hypertrophy literature (e.g., Schoenfeld volume recommendations, progressive overload, MRV, MEV) and popular science-based creators (Jeff Nippard style periodization, autoregulated RPE).
- Ensure progressive overload across accumulation weeks; then deload. Keep intensity and volume realistic for user's experience.

Output must exactly match keys and types in the program schema:
- program_id (string), name (string), paid (boolean), weeks [{week_number, days: [{day_number, focus, exercises: [{id, name, sets, reps, rpe, tempo, rest_seconds, intensity_pct?}], notes?}]}], metadata { created_at, source[], volume_profile{} }.
`;

// Helpers for session constraints and content hygiene
const CORE_EXERCISES = ['Cable Crunch', 'Hanging Leg Raise'] as const;
function isCoreExercise(name: string): boolean {
  return /cable\s+crunch|hanging\s+leg\s+raise/i.test(name);
}
function isMainCompound(name: string): boolean {
  return /barbell\s+bench\s+press|barbell\s+back\s+squat|standing\s+overhead\s+press|conventional\s+deadlift|conventional\s+deadlift|romanian\s+deadlift|front\s+squat/i.test(name);
}
function slugifyId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 16);
}
function buildAccessory(name: string): Exercise {
  return { id: `${slugifyId(name)}-${Math.random().toString(36).slice(2, 6)}`, name, sets: 2, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 120 } as Exercise;
}
function accessoryPoolForFocus(focus: string): string[] {
  const upperPool = ['Face Pull', 'Lateral Raise', 'Incline Dumbbell Curl', 'Hammer Curl', 'Overhead Triceps Extension', 'Cable Triceps Pushdown', 'Chest-Supported Row', 'Dumbbell Bench Press'];
  const lowerPool = ['Leg Extension', 'Lying Leg Curl', 'Seated Calf Raise', 'Standing Calf Raise', 'Hip Thrust', 'Bulgarian Split Squat', 'Walking Lunge', 'Leg Press'];
  const pullPool = ['Face Pull', 'Rear Delt Flye', 'Chest-Supported Row', 'Hammer Curl'];
  const pushPool = ['Lateral Raise', 'Cable Flye', 'Overhead Triceps Extension', 'Cable Triceps Pushdown'];
  const legsPool = lowerPool;
  const fullPool = Array.from(new Set([...upperPool, ...lowerPool]));
  const f = (focus || '').toLowerCase();
  if (f.includes('upper') || f.includes('pull')) return Array.from(new Set([...upperPool, ...pullPool]));
  if (f.includes('push')) return pushPool;
  if (f.includes('lower') || f.includes('leg')) return legsPool;
  return fullPool;
}
function enforceSingleCoreAlternate(exs: Exercise[], dayIndexZeroBased: number): Exercise[] {
  const desiredCore = CORE_EXERCISES[dayIndexZeroBased % CORE_EXERCISES.length];
  const kept: Exercise[] = [];
  let coreAdded = false;
  for (const ex of exs) {
    if (isCoreExercise(ex.name)) {
      if (coreAdded) continue; // drop duplicates
      kept.push({ ...ex, rest_seconds: 120 });
      coreAdded = true;
    } else {
      kept.push(ex);
    }
  }
  if (!coreAdded) kept.push(buildAccessory(desiredCore));
  return kept;
}
function dedupeByNamePreserveOrder(exs: Exercise[]): Exercise[] {
  const seen = new Set<string>();
  const out: Exercise[] = [];
  for (const ex of exs) {
    const key = ex.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ex);
  }
  return out;
}
function fillAccessoriesToCount(exs: Exercise[], desiredCount: number, focus: string): Exercise[] {
  if (exs.length >= desiredCount) return exs;
  const names = new Set(exs.map(e => e.name.toLowerCase()));
  const pool = accessoryPoolForFocus(focus);
  for (const name of pool) {
    if (exs.length >= desiredCount) break;
    if (names.has(name.toLowerCase()) || isCoreExercise(name)) continue;
    exs.push(buildAccessory(name));
    names.add(name.toLowerCase());
  }
  // If still short, add generic but unique numbered cable crunch variants avoiding duplicates (treated as accessories)
  while (exs.length < desiredCount) {
    const filler = buildAccessory('Cable Lateral Raise');
    if (!exs.some(e => e.name === filler.name)) exs.push(filler);
    else exs.push(buildAccessory('Dumbbell Curl'));
  }
  return exs;
}
function trimRespectingCoreAndCompound(exs: Exercise[], desiredCount: number): Exercise[] {
  if (exs.length <= desiredCount) return exs;
  const coreIndex = exs.findIndex(e => isCoreExercise(e.name));
  const mainCompoundIndex = exs.findIndex(e => isMainCompound(e.name));
  const keepSet = new Set<number>();
  if (coreIndex >= 0) keepSet.add(coreIndex);
  if (mainCompoundIndex >= 0) keepSet.add(mainCompoundIndex);
  const out: Exercise[] = [];
  for (let i = 0; i < exs.length; i++) {
    out.push(exs[i]);
  }
  // remove from end while respecting keepSet
  while (out.length > desiredCount) {
    const idx = out.length - 1;
    if (keepSet.has(idx)) {
      // find next removable from end
      let j = idx - 1;
      while (j >= 0 && keepSet.has(j)) j--;
      if (j >= 0) out.splice(j, 1);
      else break;
    } else {
      out.pop();
    }
  }
  return out;
}
function desiredExerciseCount(sessionMinutes: number | undefined): number {
  if (!sessionMinutes) return 6;
  return sessionMinutes >= 90 ? 7 : sessionMinutes >= 60 ? 6 : sessionMinutes >= 45 ? 5 : 4;
}
function applySessionConstraints(program: Program, input: OnboardingInput): Program {
  try {
    const target = desiredExerciseCount(input.session_length_min);
    const updatedWeeks = (program.weeks ?? []).map(week => ({
      ...week,
      days: (week.days ?? []).map((day, di) => {
        // Normalize rests
        let exs: Exercise[] = (day.exercises ?? []).map(e => ({
          ...e,
          intensity_pct: e.intensity_pct ?? undefined,
          rest_seconds: isMainCompound(e.name) ? 180 : Math.max(120, Math.min(180, e.rest_seconds ?? 120))
        } as Exercise));
        exs = dedupeByNamePreserveOrder(exs);
        exs = enforceSingleCoreAlternate(exs, di);
        exs = fillAccessoriesToCount(exs, target, day.focus ?? '');
        exs = trimRespectingCoreAndCompound(exs, target);
        return { ...day, exercises: exs };
      })
    }));
    return { ...program, weeks: updatedWeeks };
  } catch {
    return program;
  }
}

export function generateDeterministicWeek(input: OnboardingInput) {
  const exp = input.experience_level;
  const basePct = exp === 'Beginner' ? 0.65 : exp === 'Intermediate' ? 0.72 : 0.75;
  const restCompound = 180; // 3 minutes for main compounds
  const restAccessory = 120; // default 2 minutes for accessories

  const bpPct = Math.min(0.8, basePct);
  const sqPct = Math.min(0.78, basePct);
  const dlPct = Math.min(0.8, basePct);

  const twoDay: { focus: string; exercises: Exercise[]; notes?: string }[] = [
    {
      focus: 'Full Body A',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '5-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: sqPct },
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: bpPct },
        { id: 'row-01', name: 'Barbell Row', sets: 3, reps: '6-10', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 2, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 2, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Full Body B',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '2-0-1', rest_seconds: 180, intensity_pct: dlPct },
        { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'legp-01', name: 'Leg Press', sets: 2, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 2, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
      ]
    }
  ];

  const threeDay = [
    {
      focus: 'Upper',
      exercises: [
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: bpPct },
        { id: 'row-01', name: 'Barbell Row', sets: 4, reps: '6-10', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'lat-01', name: 'Lateral Raise', sets: 2, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 2, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Lower',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: sqPct },
        { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 8, tempo: '3-0-1', rest_seconds: restCompound },
        { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'curl-02', name: 'Lying Leg Curl', sets: 2, reps: '10-12', rpe: 8, tempo: '2-1-1', rest_seconds: 90 },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Full body',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '2-0-1', rest_seconds: 180, intensity_pct: dlPct },
        { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'face-01', name: 'Face Pull', sets: 2, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
        { id: 'abs-01', name: 'Cable Crunch', sets: 2, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    }
  ];

  const fourDay = [
    {
      focus: 'Upper 1',
      exercises: [
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: bpPct },
        { id: 'row-01', name: 'Barbell Row', sets: 4, reps: '6-10', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'lat-01', name: 'Lateral Raise', sets: 2, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 2, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Lower 1',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: sqPct },
        { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 8, tempo: '3-0-1', rest_seconds: restCompound },
        { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Upper 2',
      exercises: [
        { id: 'ohp-02', name: 'Standing Overhead Press', sets: 4, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Lower 2',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '2-0-1', rest_seconds: 180, intensity_pct: dlPct },
        { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'curl-02', name: 'Lying Leg Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-1-1', rest_seconds: 90 },
        { id: 'abs-01', name: 'Cable Crunch', sets: 3, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    }
  ];

  const fiveDay = [
    {
      focus: 'Push',
      exercises: [
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: bpPct },
        { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'lat-01', name: 'Lateral Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 3, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Pull',
      exercises: [
        { id: 'row-01', name: 'Barbell Row', sets: 4, reps: '6-10', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'face-01', name: 'Face Pull', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Legs',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: sqPct },
        { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 8, tempo: '3-0-1', rest_seconds: restCompound },
        { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Upper',
      exercises: [
        { id: 'bp-02', name: 'Close-Grip Bench Press', sets: 3, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: Math.max(0.68, bpPct - 0.03) },
        { id: 'ohp-02', name: 'Standing Overhead Press', sets: 3, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 2, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    },
    {
      focus: 'Lower',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '2-0-1', rest_seconds: 180, intensity_pct: dlPct },
        { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
        { id: 'curl-02', name: 'Lying Leg Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-1-1', rest_seconds: 90 },
        { id: 'abs-01', name: 'Cable Crunch', sets: 3, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
      ]
    }
  ];

  const sixDayFocus = input.focus_point ?? 'Arms';
  const sixDay = [
    fiveDay[0], // Push
    fiveDay[1], // Pull
    fiveDay[2], // Legs
    fourDay[0], // Upper 1
    fourDay[1], // Lower 1
    {
      focus: `Focus — ${sixDayFocus}`,
      exercises: [
        { id: 'row-02', name: 'Chest-Supported Row', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
        { id: 'curl-02', name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
        { id: 'tri-02', name: 'Cable Triceps Pushdown', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
        { id: 'lat-02', name: 'Cable Lateral Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
      ]
    }
  ];

  const daysPerWeek = input.training_frequency_preference;
  let selected: { focus: string; exercises: Exercise[]; notes?: string }[];
  if (daysPerWeek === 2) selected = twoDay;
  else if (daysPerWeek === 3) selected = threeDay as any;
  else if (daysPerWeek === 4) selected = fourDay as any;
  else if (daysPerWeek === 5) selected = fiveDay as any;
  else if (daysPerWeek === 6) selected = sixDay as any;
  else selected = threeDay as any;

  // Enforce exercise counts per session length: 30→4, 45→5, 60→6, 90→7
  const desiredCount = desiredExerciseCount(input.session_length_min);

  return {
    week_number: 1,
    days: selected.map((d, i) => {
      // Start from template then apply constraints: dedupe, single core, fill unique accessories, trim if needed
      let exs: Exercise[] = d.exercises.map(e => ({ ...e, intensity_pct: e.intensity_pct ?? undefined, rest_seconds: isMainCompound(e.name) ? 180 : 120 } as Exercise));
      exs = dedupeByNamePreserveOrder(exs);
      exs = enforceSingleCoreAlternate(exs, i);
      exs = fillAccessoriesToCount(exs, desiredCount, d.focus);
      exs = trimRespectingCoreAndCompound(exs, desiredCount);
      return { day_number: i + 1, focus: d.focus, exercises: exs, notes: d.notes };
    })
  };
}

export function generateFullProgram(input: OnboardingInput) {
  const weeks = [] as Array<{ week_number: number; days: any[] }>;
  const daysPerWeek = input.training_frequency_preference;
  for (let w = 1; w <= 12; w++) {
    const baseWeek = generateDeterministicWeek(input);
    // Progression: 3-week accumulation, 1-week deload cycle
    const cyclePos = ((w - 1) % 4) + 1; // 1..4
    const volumeMultiplier = cyclePos === 4 ? 0.6 : 1 + 0.05 * (cyclePos - 1); // 1.0, 1.05, 1.10, 0.6
    const intensityBump = cyclePos === 4 ? -0.05 : 0.01 * (w - 1); // slight upward trend, deload down

    const adjustedDays = baseWeek.days.map(day => ({
      ...day,
    exercises: day.exercises.map(ex => {
        const sets = Math.max(1, Math.round(ex.sets * volumeMultiplier));
        const intensity_pct = ex.intensity_pct != null ? Math.max(0.5, Math.min(0.9, (ex.intensity_pct + intensityBump))) : undefined;
      // Ensure rest rules persist across weeks
      const isCompound = /barbell\s+bench\s+press|barbell\s+back\s+squat|standing\s+overhead\s+press|conventional\s+deadlift/i.test(ex.name);
      const rest_seconds = isCompound ? 180 : Math.max(120, Math.min(180, ex.rest_seconds ?? 120));
      return { ...ex, sets, intensity_pct, rest_seconds };
      })
    }));

    weeks.push({ week_number: w, days: adjustedDays });
  }
  return weeks;
}

export function enforceDaysSplit(program: Program, input: OnboardingInput): Program {
  try {
    const desired = generateDeterministicWeek(input);
    const desiredCount = desired.days.length;
    const alignedWeeks = (program.weeks ?? []).map(week => {
      const currentDays = week.days ?? [];
      if (currentDays.length === desiredCount) {
        // Normalize day_number sequence only; preserve content
        return { ...week, days: currentDays.map((d, i) => ({ ...d, day_number: i + 1 })) };
      }
      if (currentDays.length < desiredCount) {
        // Pad with empty days using desired day focuses, but do not replace existing content
        const pads = desired.days.slice(currentDays.length, desiredCount).map((d, i) => ({
          day_number: currentDays.length + i + 1,
          focus: d.focus,
          exercises: d.exercises,
          notes: d.notes
        }));
        return { ...week, days: [...currentDays.map((d, i) => ({ ...d, day_number: i + 1 })), ...pads] };
      }
      // Truncate extra days but keep original content for the retained days
      const trimmed = currentDays.slice(0, desiredCount).map((d, i) => ({ ...d, day_number: i + 1 }));
      return { ...week, days: trimmed };
    });
    return { ...program, weeks: alignedWeeks };
  } catch {
    return program;
  }
}

export async function refineWithGPT(baseProgram: any, citations: string[]) {
  if (!process.env.OPENAI_API_KEY) return baseProgram;
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `You are a strength coach. Refine the provided 12-week hypertrophy program JSON by adding microprogression notes, deload adjustments (3:1), and safe swaps respecting injuries/equipment. Return valid JSON only. Citations: ${citations.join(', ')}`;
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' as any },
      messages: [
        { role: 'system', content: 'Return JSON only.' },
        { role: 'user', content: prompt },
        { role: 'user', content: JSON.stringify(baseProgram) }
      ]
    } as any);
    const text = (response as any).choices?.[0]?.message?.content;
    if (!text) return baseProgram;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const refined = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      return refined;
    }
  } catch {
    return baseProgram;
  }
  return baseProgram;
}

export async function generateProgramWithLLM(input: OnboardingInput, opts?: { programId?: string; citations?: string[] }): Promise<Program> {
  const programId = opts?.programId ?? crypto.randomUUID();
  if (!process.env.OPENAI_API_KEY) {
    const weeks = generateFullProgram(input);
    const fallback: Program = {
      program_id: programId,
      name: '12-week Hypertrophy Program',
      paid: false,
      weeks,
      metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {}, big3_prs: input.big3_PRs ?? {}, experience_level: input.experience_level }
    };
    return fallback;
  }
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userProfile = buildUserProfile(input);
    const citations = opts?.citations ?? ['Schoenfeld', 'Nuckols', 'Jeff Nippard', 'Mike Israetel', 'Helms'];

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' as any },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User profile:\n${userProfile}\nProgram id: ${programId}\nCitations to include in metadata.source: ${citations.join(', ')}` }
      ]
    } as any);

    const text = (response as any).choices?.[0]?.message?.content ?? '';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd <= jsonStart) throw new Error('No JSON in response');
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    let prepared = ensureMetadata(coerceProgramId(parsed, programId));
    (prepared as any).metadata = {
      ...(prepared as any).metadata,
      big3_prs: input.big3_PRs ?? {},
      experience_level: input.experience_level
    };
    prepared = enforceDaysSplit(prepared as Program, input);
    prepared = applySessionConstraints(prepared as Program, input);
    try {
      return toProgramOrThrow(prepared);
    } catch {
      const repaired = await repairWithModel(JSON.stringify(prepared), validateProgram.errors ?? []);
      if (repaired) {
        const reparsed = JSON.parse(repaired);
        let final = ensureMetadata(coerceProgramId(reparsed, programId));
        final = enforceDaysSplit(final as Program, input);
        final = applySessionConstraints(final as Program, input);
        (final as any).metadata = {
          ...(final as any).metadata,
          big3_prs: input.big3_PRs ?? {},
          experience_level: input.experience_level
        };
        return toProgramOrThrow(final);
      }
      throw new Error('Repair failed');
    }
  } catch {
    const weeks = generateFullProgram(input);
    const fallback: Program = {
      program_id: programId,
      name: '12-week Hypertrophy Program',
      paid: false,
      weeks,
      metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {}, big3_prs: input.big3_PRs ?? {}, experience_level: input.experience_level }
    };
    return fallback;
  }
}

export async function saveProgramToSupabase(program: any) {
  // Deprecated: prefer calling code to perform writes using a service client and handle errors
  throw new Error('saveProgramToSupabase is deprecated. Use server route with service client to persist.');
}

export function canViewWeek(week: number, paid: boolean) {
  return week <= 1 || paid;
}


