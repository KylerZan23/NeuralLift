import { z } from 'zod';
import type { Program, Day, Week } from '@/types/program';
import OpenAI from 'openai';
import { LIFTING_PRINCIPLES } from './knowledge-base';
import { getLLMClient } from './llm-client';

const HighLevelPlanSchema = z.object({
  programName: z.string().describe("A creative, motivating name for the 12-week program."),
  weeks: z.array(z.object({
    week_number: z.number().int().min(1).max(12),
    focus: z.string().describe("The primary focus for this week, e.g., 'Hypertrophy Accumulation 1', 'Strength Introduction', 'Deload & Recovery'."),
    notes: z.string().describe("A brief, motivating note for the user about the goal of this week's training.")
  })).length(12)
});

export type HighLevelPlan = z.infer<typeof HighLevelPlanSchema>;

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

type Exercise = Day['exercises'][0];

function ensureMetadata(p: Program): Program {
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
    `PRs (lbs): bench=${pr.bench ?? 'n/a'}, squat=${pr.squat ?? 'n/a'}, deadlift=${pr.deadlift ?? 'n/a'}.`,
    `Injuries: ${inj || 'none'}.`,
    `Movement prefs: ${prefs || 'none'}.`,
    focus
  ].join(' ');
}

function retrieveRelevantPrinciples(input: OnboardingInput): string {
  const inputKeywords = new Set([
    input.experience_level.toLowerCase(),
    ...input.goals,
    `${input.training_frequency_preference}_days`
  ]);

  const relevantPrinciples = LIFTING_PRINCIPLES.filter(p =>
    p.keywords.some(k => inputKeywords.has(k))
  );

  if (relevantPrinciples.length === 0) return "";

  return "Consider these guiding principles:\n" + relevantPrinciples.map(p => `- ${p.topic}: ${p.content}`).join("\n");
}



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
  return { id: `${slugifyId(name)}-${Math.random().toString(36).slice(2, 6)}`, name, sets: 2, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 } as Exercise;
}

type EquipmentMode = 'gym' | 'dumbbells' | 'barbell';

function getEquipmentMode(input: OnboardingInput): EquipmentMode {
  const first = (input.equipment_available ?? [])[0]?.toLowerCase() ?? '';
  if (/dumbbell/.test(first)) return 'dumbbells';
  if (/barbell/.test(first)) return 'barbell';
  // default to gym if unspecified
  return 'gym';
}

function normalizeNameForEquipment(originalName: string, mode: EquipmentMode): string {
  // In commercial gym, prefer machine-supported row over barbell row for safety/consistency
  if (mode === 'gym' && /barbell\s+row/i.test(originalName)) return 'Chest-Supported Row';
  return originalName;
}

function substituteExerciseForEquipment(name: string, mode: EquipmentMode): string {
  const n = name.toLowerCase();
  if (mode === 'dumbbells') {
    if (/barbell\s+back\s+squat/.test(n)) return 'Bulgarian Split Squat';
    if (/front\s+squat/.test(n)) return 'Goblet Squat';
    if (/conventional\s+deadlift/.test(n)) return 'Dumbbell Romanian Deadlift';
    if (/romanian\s+deadlift/.test(n)) return 'Dumbbell Romanian Deadlift';
    if (/bench\s+press/.test(n)) return 'Dumbbell Bench Press';
    if (/standing\s+overhead\s+press/.test(n)) return 'Seated Dumbbell Shoulder Press';
    if (/lat\s+pulldown/.test(n)) return 'One-Arm Dumbbell Row';
    if (/leg\s+press/.test(n)) return 'Bulgarian Split Squat';
    if (/(lying\s+)?leg\s+curl/.test(n)) return 'Single-Leg Dumbbell Romanian Deadlift';
    if (/leg\s+extension/.test(n)) return 'Lunges';
    if (/seated\s+calf\s+raise/.test(n)) return 'Standing Calf Raise';
    if (/cable\s+triceps\s+pushdown/.test(n)) return 'Overhead Dumbbell Triceps Extension';
    if (/overhead\s+triceps\s+extension/.test(n)) return 'Overhead Dumbbell Triceps Extension';
    if (/ez\s+bar\s+curl/.test(n)) return 'Dumbbell Curl';
    if (/cable\s+flye/.test(n)) return 'Dumbbell Flye';
    if (/cable\s+lateral\s+raise/.test(n)) return 'Lateral Raise';
    if (/face\s+pull/.test(n)) return 'Rear Delt Flye';
    if (/cable\s+crunch/.test(n)) return 'Dumbbell Crunch';
    // generic cable/machine fallbacks
    if (/cable|machine|smith/.test(n)) return 'Dumbbell Curl';
    if (/row\b/.test(n) && !/dumbbell/.test(n)) return 'One-Arm Dumbbell Row';
    if (/press\b/.test(n) && !/dumbbell/.test(n)) return 'Dumbbell Bench Press';
  }
  if (mode === 'barbell') {
    if (/incline\s+dumbbell\s+press/.test(n)) return 'Incline Barbell Bench Press';
    if (/dumbbell\s+bench\s+press/.test(n)) return 'Barbell Bench Press';
    if (/seated\s+dumbbell\s+shoulder\s+press/.test(n)) return 'Standing Overhead Press';
    if (/lat\s+pulldown/.test(n)) return 'Barbell Row';
    if (/chest\-supported\s+row/.test(n)) return 'Barbell Row';
    if (/face\s+pull/.test(n)) return 'Barbell Row';
    if (/cable\s+flye/.test(n)) return 'Close-Grip Bench Press';
    if (/cable\s+triceps\s+pushdown/.test(n)) return 'Lying Barbell Triceps Extension';
    if (/lateral\s+raise/.test(n)) return 'Standing Overhead Press';
    if (/leg\s+press/.test(n)) return 'Barbell Lunge';
    if (/lying\s+leg\s+curl/.test(n)) return 'Romanian Deadlift';
    if (/seated\s+calf\s+raise/.test(n)) return 'Standing Calf Raise';
    if (/cable\s+crunch/.test(n)) return 'Plank';
    if (/dumbbell/.test(n)) return name.replace(/dumbbell/gi, 'Barbell');
    if (/machine|smith/.test(n)) return 'Barbell Row';
  }
  return name;
}

function equipmentCoreExercises(mode: EquipmentMode): readonly [string, string] {
  if (mode === 'dumbbells') return ['Dumbbell Crunch', 'Plank'] as const;
  if (mode === 'barbell') return ['Hanging Leg Raise', 'Plank'] as const;
  return CORE_EXERCISES;
}
function accessoryPoolForFocus(focus: string): string[] {
  const upperPool = ['Face Pull', 'Lateral Raise', 'Incline Dumbbell Curl', 'Hammer Curl', 'Overhead Triceps Extension', 'Cable Triceps Pushdown', 'Chest-Supported Row', 'Dumbbell Bench Press'];
  const lowerPool = ['Leg Extension', 'Lying Leg Curl', 'Seated Calf Raise', 'Standing Calf Raise', 'Hip Thrust', 'Bulgarian Split Squat', 'Walking Lunge', 'Leg Press'];
  const pullPool = ['Face Pull', 'Rear Delt Flye', 'Chest-Supported Row', 'Hammer Curl'];
  const pushPool = ['Lateral Raise', 'Cable Flye', 'Overhead Triceps Extension', 'Cable Triceps Pushdown'];
  const legsPool = lowerPool;
  const fullPool = Array.from(new Set([...upperPool, ...lowerPool]));
  const f = (focus || '').toLowerCase();
  const removeLateralRaises = (arr: string[]) => arr.filter(n => !/\blateral\s+raise\b/i.test(n));
  if (f.includes('upper') || f.includes('pull')) return removeLateralRaises(Array.from(new Set([...upperPool, ...pullPool])));
  if (f.includes('push')) return pushPool;
  if (f.includes('lower') || f.includes('leg')) return legsPool;
  return fullPool;
}
function pickCoreDayIndices(totalDays: number): number[] {
  if (totalDays <= 0) return [];
  if (totalDays === 1) return [0];
  const first = 0;
  let second = Math.floor(totalDays / 2);
  if (second === first) second = Math.min(totalDays - 1, first + 1);
  return [first, second];
}

function enforceCoreForDay(exs: Exercise[], desiredCoreName: string | null): Exercise[] {
  // Remove all existing core moves first
  const nonCore: Exercise[] = exs.filter(e => !isCoreExercise(e.name));
  if (!desiredCoreName) return nonCore;
  // Ensure exactly one core exercise with specified name
  const coreEx = buildAccessory(desiredCoreName);
  coreEx.rest_seconds = 120;
  return [...nonCore, coreEx];
}
function dedupeByNamePreserveOrder(exs: Exercise[], mode: EquipmentMode): Exercise[] {
  const seen = new Set<string>();
  const out: Exercise[] = [];
  for (const ex of exs) {
    // Normalize aliases by equipment context
    const normalizedName = normalizeNameForEquipment(ex.name, mode);
    const key = normalizedName.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...ex, name: normalizedName });
  }
  return out;
}

function ensureNoCalfRaiseConflict(exs: Exercise[]): Exercise[] {
  const isStanding = (n: string) => /standing\s+calf\s+raise/i.test(n);
  const isSeated = (n: string) => /seated\s+calf\s+raise/i.test(n);
  let standingIndex = -1;
  let seatedIndex = -1;
  exs.forEach((e, i) => {
    const name = e.name ?? '';
    if (standingIndex === -1 && isStanding(name)) standingIndex = i;
    if (seatedIndex === -1 && isSeated(name)) seatedIndex = i;
  });
  if (standingIndex >= 0 && seatedIndex >= 0) {
    const removeIndex = Math.max(standingIndex, seatedIndex);
    return exs.filter((_, i) => i !== removeIndex);
  }
  return exs;
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
    const f = (focus || '').toLowerCase();
    const fallbackName = f.includes('pull')
      ? 'Chest-Supported Row'
      : f.includes('push')
        ? 'Cable Flye'
        : f.includes('leg')
          ? 'Leg Extension'
          : 'Dumbbell Curl';
    const filler = buildAccessory(fallbackName);
    if (!exs.some(e => e.name.toLowerCase() === filler.name.toLowerCase())) exs.push(filler);
    else exs.push(buildAccessory('Hammer Curl'));
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
    const exercise = exs[i];
    if (exercise) { // Check if the exercise exists
      out.push(exercise);
    }
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
    const mode = getEquipmentMode(input);
    const target = desiredExerciseCount(input.session_length_min);
    const updatedWeeks = (program.weeks ?? []).map(week => ({
      ...week,
      days: (week.days ?? []).map((day, di) => {
        // Normalize rests
        let exs: Exercise[] = (day.exercises ?? []).map(e => ({
          ...e,
          rest_seconds: 180 // All exercises use 3 minutes rest
        } as Exercise));
        // Equipment substitutions first
        exs = exs.map(e => ({ ...e, name: substituteExerciseForEquipment(e.name, mode) }));
        exs = dedupeByNamePreserveOrder(exs, mode);
        // Avoid conflicting calf raises within a single session
        exs = ensureNoCalfRaiseConflict(exs);
        // Core placement: exactly two sessions per week include core (Cable Crunch and Hanging Leg Raise)
        const coreDays = pickCoreDayIndices((week.days ?? []).length);
        const coreNames = equipmentCoreExercises(mode);
        const desiredCoreName = coreDays.includes(di) ? (coreNames[coreDays.indexOf(di)] ?? null) : null;
        exs = enforceCoreForDay(exs, desiredCoreName);
        exs = fillAccessoriesToCount(exs, target, day.focus ?? '');
        // Re-run equipment substitutions for any newly added accessories
        exs = exs.map(e => ({ ...e, name: substituteExerciseForEquipment(e.name, mode) }));
        exs = dedupeByNamePreserveOrder(exs, mode);
        // Re-apply calf conflict rule after substitutions/fills
        exs = ensureNoCalfRaiseConflict(exs);
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
  const restCompound = 180; // 3 minutes for all exercises
  const restAccessory = 180; // 3 minutes for all exercises

  const twoDay: Day[] = [
    {
      day_number: 1,
      focus: 'Full Body A',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '5-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'row-01', name: 'Chest-Supported Row', sets: 3, reps: '6-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 2, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 2, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 2,
      focus: 'Full Body B',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'legp-01', name: 'Leg Press', sets: 2, reps: '10-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 2, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    }
  ];

  const threeDay: Day[] = [
    {
      day_number: 1,
      focus: 'Upper',
      exercises: [
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'row-01', name: 'Chest-Supported Row', sets: 4, reps: '6-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'lat-01', name: 'Lateral Raise', sets: 2, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 2, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 2,
      focus: 'Lower',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'curl-02', name: 'Lying Leg Curl', sets: 2, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 3,
      focus: 'Full body',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'face-01', name: 'Face Pull', sets: 2, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'abs-01', name: 'Cable Crunch', sets: 2, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    }
  ];

  const fourDay: Day[] = [
    {
      day_number: 1,
      focus: 'Upper 1',
      exercises: [
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'row-01', name: 'Chest-Supported Row', sets: 4, reps: '6-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'lat-01', name: 'Lateral Raise', sets: 2, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 2, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 2,
      focus: 'Lower 1',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 3,
      focus: 'Upper 2',
      exercises: [
        { id: 'ohp-02', name: 'Standing Overhead Press', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 4,
      focus: 'Lower 2',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'curl-02', name: 'Lying Leg Curl', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'abs-01', name: 'Cable Crunch', sets: 3, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    }
  ];

  const fiveDay: Day[] = [
    {
      day_number: 1,
      focus: 'Push',
      exercises: [
        { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'lat-01', name: 'Lateral Raise', sets: 3, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 3, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 2,
      focus: 'Pull',
      exercises: [
        { id: 'row-01', name: 'Chest-Supported Row', sets: 4, reps: '6-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'face-01', name: 'Face Pull', sets: 3, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 3,
      focus: 'Legs',
      exercises: [
        { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 4,
      focus: 'Upper',
      exercises: [
        { id: 'bp-02', name: 'Close-Grip Bench Press', sets: 3, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'ohp-02', name: 'Standing Overhead Press', sets: 3, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'curl-01', name: 'EZ Bar Curl', sets: 2, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    },
    {
      day_number: 5,
      focus: 'Lower',
      exercises: [
        { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '4-6', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 7, tempo: '', rest_seconds: restCompound },
        { id: 'curl-02', name: 'Lying Leg Curl', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'abs-01', name: 'Cable Crunch', sets: 3, reps: '10-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    }
  ];

  const sixDayFocus = input.focus_point ?? 'Arms';
  const sixDay: Day[] = [
    fiveDay[0]!, // Push
    fiveDay[1]!, // Pull
    fiveDay[2]!, // Legs
    fourDay[0]!, // Upper 1
    fourDay[1]!, // Lower 1
    {
      day_number: 6,
      focus: `Focus — ${sixDayFocus}`,
      exercises: [
        { id: 'row-02', name: 'Chest-Supported Row', sets: 3, reps: '8-12', rpe: 7, tempo: '', rest_seconds: restAccessory },
        { id: 'curl-02', name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'tri-02', name: 'Cable Triceps Pushdown', sets: 3, reps: '10-12', rpe: 7, tempo: '', rest_seconds: 180 },
        { id: 'lat-02', name: 'Cable Lateral Raise', sets: 3, reps: '12-15', rpe: 7, tempo: '', rest_seconds: 180 },
      ]
    }
  ];

  const daysPerWeek = input.training_frequency_preference;
  let selected: Day[];
  if (daysPerWeek === 2) selected = twoDay;
  else if (daysPerWeek === 3) selected = threeDay;
  else if (daysPerWeek === 4) selected = fourDay;
  else if (daysPerWeek === 5) selected = fiveDay;
  else if (daysPerWeek === 6) selected = sixDay;
  else selected = threeDay;

  // Enforce exercise counts per session length: 30→4, 45→5, 60→6, 90→7
  const desiredCount = desiredExerciseCount(input.session_length_min);

  return {
    week_number: 1,
    days: selected.map((d, i) => {
      // Start from template then apply constraints: dedupe, single core, fill unique accessories, trim if needed
      const mode = getEquipmentMode(input);
      let exs: Exercise[] = d.exercises.map(e => ({ ...e, rest_seconds: 180 } as Exercise));
      // Equipment substitutions before normalization
      exs = exs.map(e => ({ ...e, name: substituteExerciseForEquipment(e.name, mode) }));
      exs = dedupeByNamePreserveOrder(exs, mode);
      // Align initial week with the same two-core-day policy (equipment-aware)
      const coreDays = pickCoreDayIndices(selected.length);
      const coreNames = equipmentCoreExercises(mode);
      const desiredCoreName = coreDays.includes(i) ? (coreNames[coreDays.indexOf(i)] ?? null) : null;
      // Enforce calf raise conflict rule
      exs = ensureNoCalfRaiseConflict(exs);
      exs = enforceCoreForDay(exs, desiredCoreName);
      exs = fillAccessoriesToCount(exs, desiredCount, d.focus);
      // Re-run equipment substitutions after filling accessories
      exs = exs.map(e => ({ ...e, name: substituteExerciseForEquipment(e.name, mode) }));
      exs = dedupeByNamePreserveOrder(exs, mode);
      exs = ensureNoCalfRaiseConflict(exs);
      exs = trimRespectingCoreAndCompound(exs, desiredCount);
      return { day_number: i + 1, focus: d.focus, exercises: exs, notes: d.notes ?? null };
    })
  };
}

export function generateFullProgram(input: OnboardingInput) {
  const weeks: Program['weeks'] = [];
  for (let w = 1; w <= 12; w++) {
    const baseWeek = generateDeterministicWeek(input);
    // Progression: 3-week accumulation, 1-week deload cycle
    const cyclePos = ((w - 1) % 4) + 1; // 1..4
    const volumeMultiplier = cyclePos === 4 ? 0.6 : 1 + 0.05 * (cyclePos - 1); // 1.0, 1.05, 1.10, 0.6

    const adjustedDays = baseWeek.days.map(day => ({
      day_number: day.day_number,
      focus: day.focus,
      notes: day.notes ?? null,
      exercises: day.exercises.map(ex => {
        const sets = Math.max(1, Math.round(ex.sets * volumeMultiplier));
        // All exercises use 3 minutes rest
        const rest_seconds = 180;
        return { ...ex, sets, rest_seconds };
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

export async function refineWithGPT(baseProgram: Program, citations: string[]): Promise<Program> {
  if (!process.env.OPENAI_API_KEY) return baseProgram;
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `You are a strength coach. Refine the provided 12-week hypertrophy program JSON by adding microprogression notes, deload adjustments (3:1), and safe swaps respecting injuries/equipment. Return valid JSON only. Citations: ${citations.join(', ')}`;
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      stream: false, // Ensure this line is added
      messages: [
        { role: 'system', content: 'Return JSON only.' },
        { role: 'user', content: prompt },
        { role: 'user', content: JSON.stringify(baseProgram) }
      ]
    } as OpenAI.Chat.ChatCompletionCreateParams);
    
    // Check if it's a non-streaming response
    if (!('choices' in response)) {
      return baseProgram;
    }
    
    const text = response.choices?.[0]?.message?.content;
    if (!text) return baseProgram;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const refined = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Program;
      return refined;
    }
  } catch {
    return baseProgram;
  }
  return baseProgram;
}

export async function generateProgramWithLLM(
  input: OnboardingInput,
  opts?: { programId?: string; citations?: string[]; userId?: string }
): Promise<Program> {
  const programId = opts?.programId ?? crypto.randomUUID();
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required for program generation. Please configure OPENAI_API_KEY environment variable.');
  }

  try {
    console.log('🎯 [generateProgramWithLLM] Starting two-phase AI program generation...');
    
    // Model configuration for cost and performance optimization
    const PLANNER_MODEL = 'gpt-4o'; // High-quality planning model
    const WORKER_MODEL = 'gpt-4o';  // Fast, efficient worker model
    
    // Phase 1: Generate high-level plan
    console.log('📋 [generateProgramWithLLM] Phase 1: Generating high-level mesocycle plan...');
    const highLevelPlan = await generateHighLevelPlan(input, PLANNER_MODEL);
    console.log(`✅ [generateProgramWithLLM] Generated plan: "${highLevelPlan.programName}"`);

    // Phase 2: Generate detailed weeks in parallel
    console.log('⚙️ [generateProgramWithLLM] Phase 2: Generating detailed weeks in parallel...');
    const weekPromises = highLevelPlan.weeks.map(highLevelWeek => 
      generateDetailedWeek(input, highLevelWeek, WORKER_MODEL)
    );
    
    const detailedWeeks = await Promise.all(weekPromises);
    console.log('✅ [generateProgramWithLLM] All 12 weeks generated successfully');

    // Phase 3: Assemble final program
    console.log('🔧 [generateProgramWithLLM] Phase 3: Assembling final program...');
    const citations = opts?.citations ?? ['Schoenfeld', 'Nuckols', 'Jeff Nippard', 'Mike Israetel', 'Helms'];
    
    let program: Program = {
      program_id: programId,
      name: highLevelPlan.programName,
      paid: false,
      weeks: detailedWeeks,
      metadata: {
        created_at: new Date().toISOString(),
        source: citations,
        volume_profile: {},
        big3_prs: input.big3_PRs ?? {},
        experience_level: input.experience_level,
        generation_method: 'two_phase_ai'
      }
    };

    // Add user_id if provided
    if (opts?.userId) {
      program.user_id = opts.userId;
    }

    // Apply existing helper functions for final processing
    program = ensureMetadata(program);
    program = enforceDaysSplit(program, input);
    program = applySessionConstraints(program, input);

    console.log('🎉 [generateProgramWithLLM] Program generation completed successfully');
    return program;

  } catch (error) {
    console.error('❌ [generateProgramWithLLM] Two-phase AI generation failed:', error);
    
    // Check for quota/billing errors and provide fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
      console.log('⚠️ [generateProgramWithLLM] Quota exceeded, falling back to deterministic generation');
      const weeks = generateFullProgram(input);
      const fallback: Program = {
        program_id: programId,
        name: '12-Week Hypertrophy Program (Fallback)',
        paid: false,
        weeks,
        metadata: { 
          created_at: new Date().toISOString(), 
          source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], 
          volume_profile: {}, 
          big3_prs: input.big3_PRs ?? {}, 
          experience_level: input.experience_level,
          fallback_reason: 'OpenAI quota exceeded',
          generation_method: 'deterministic_fallback'
        }
      } as Program;
      if (opts?.userId) fallback.user_id = opts.userId;
      return fallback;
    }
    
    throw new Error(`AI program generation failed: ${errorMessage}. Please try again.`);
  }
}

export async function saveProgramToSupabase(): Promise<void> {
  // Deprecated: prefer calling code to perform writes using a service client and handle errors
  throw new Error('saveProgramToSupabase is deprecated. Use server route with service client to persist.');
}

export function canViewWeek(week: number, paid: boolean) {
  return week <= 1 || paid;
}

export async function generateHighLevelPlan(input: OnboardingInput, modelName: string = 'gpt-4o'): Promise<HighLevelPlan> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required for high-level plan generation. Please configure OPENAI_API_KEY environment variable.');
  }

  try {
    const client = getLLMClient(modelName);

    // Retrieve relevant principles based on user input
    const relevantPrinciples = retrieveRelevantPrinciples(input);
    const userProfile = buildUserProfile(input);
    
    const plannerPrompt = `Based on the user's profile and the following evidence-based principles, create a high-level 12-week plan.

${relevantPrinciples}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON matching the exact schema below
- Create exactly 12 weeks (week_number 1-12)
- Follow 3:1 accumulation-to-deload pattern: weeks 1-3 accumulate, week 4 deload, repeat 3 times
- Consider the user's experience level, goals, and training frequency
- Make the program name creative and motivating
- Week focuses should progress logically through the mesocycle
- Notes should be brief, motivating, and specific to that week's purpose
- Ground your decisions in the provided evidence-based principles

REQUIRED JSON SCHEMA:
{
  "programName": "string (creative, motivating name)",
  "weeks": [
    {
      "week_number": 1,
      "focus": "string (e.g., 'Hypertrophy Accumulation 1', 'Strength Introduction', 'Deload & Recovery')",
      "notes": "string (brief motivating note about this week's training goal)"
    }
    // ... repeat for all 12 weeks
  ]
}

EXAMPLE PROGRESSION PATTERNS:
- Weeks 1-3: "Hypertrophy Accumulation 1-3" 
- Week 4: "Deload & Recovery"
- Weeks 5-7: "Strength-Hypertrophy Blend 1-3"
- Week 8: "Active Recovery"
- Weeks 9-11: "Peak Volume 1-3"
- Week 12: "Transition & Assessment"

User Profile: ${userProfile}`;

    const response = await client.chat.completions.create({
      model: modelName,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      stream: false,
      messages: [
        { role: 'system', content: 'You are a professional strength coach. Return only valid JSON conforming to the provided schema. No additional text.' },
        { role: 'user', content: plannerPrompt }
      ]
    });

    // Check if it's a non-streaming response
    if (!('choices' in response)) {
      throw new Error('Received streaming response when expecting non-streaming');
    }

    const text = response.choices?.[0]?.message?.content ?? '';
    
    // Find JSON boundaries
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      throw new Error('No valid JSON found in response');
    }
    
    // Extract and parse JSON
    let rawJson = text.slice(jsonStart, jsonEnd + 1);
    
    // Basic cleanup for common AI JSON errors
    rawJson = rawJson.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    try {
      const parsed = JSON.parse(rawJson);
      
      // Validate against our schema
      const validated = HighLevelPlanSchema.parse(parsed);
      
      return validated;
    } catch (parseError) {
      console.error('❌ [generateHighLevelPlan] JSON parsing or validation failed:', parseError);
      console.error('Raw response:', text);
      throw new Error(`Failed to parse or validate high-level plan: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ [generateHighLevelPlan] Failed to generate high-level plan:', error);
    
    // Check for quota errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
      console.log('⚠️ [generateHighLevelPlan] Quota exceeded, providing fallback plan');
      
      // Fallback plan following 3:1 pattern
      return {
        programName: "12-Week Hypertrophy Transformation (Fallback)",
        weeks: [
          { week_number: 1, focus: "Hypertrophy Accumulation 1", notes: "Building the foundation with moderate volume and intensity." },
          { week_number: 2, focus: "Hypertrophy Accumulation 2", notes: "Increasing training stress while maintaining form focus." },
          { week_number: 3, focus: "Hypertrophy Accumulation 3", notes: "Peak accumulation week - push your limits safely." },
          { week_number: 4, focus: "Deload & Recovery", notes: "Active recovery to optimize adaptation and prevent burnout." },
          { week_number: 5, focus: "Strength-Hypertrophy Blend 1", notes: "Introducing heavier loads while maintaining muscle-building focus." },
          { week_number: 6, focus: "Strength-Hypertrophy Blend 2", notes: "Balancing strength gains with continued hypertrophy stimulus." },
          { week_number: 7, focus: "Strength-Hypertrophy Blend 3", notes: "Maximizing the strength-size adaptation window." },
          { week_number: 8, focus: "Active Recovery", notes: "Strategic deload to prepare for final phase intensification." },
          { week_number: 9, focus: "Peak Volume 1", notes: "Highest training volumes - your body is adapted and ready." },
          { week_number: 10, focus: "Peak Volume 2", notes: "Maintaining peak stimulus while monitoring recovery carefully." },
          { week_number: 11, focus: "Peak Volume 3", notes: "Final push - everything you've built leads to this week." },
          { week_number: 12, focus: "Transition & Assessment", notes: "Celebrating progress and setting up for your next training phase." }
        ]
      };
    }
    
    throw new Error(`High-level plan generation failed: ${errorMessage}. Please try again.`);
  }
}

export async function generateDetailedWeek(
  input: OnboardingInput, 
  highLevelWeek: HighLevelPlan['weeks'][0],
  modelName: string = 'gpt-4o'
): Promise<Week> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required for detailed week generation. Please configure OPENAI_API_KEY environment variable.');
  }

  try {
    const client = getLLMClient(modelName);

    // Create the Week schema dynamically from the existing JSON schema
    const weekSchema = {
      type: "object",
      required: ["week_number", "days"],
      properties: {
        week_number: { 
          type: "integer", 
          minimum: 1, 
          maximum: 12,
          description: "The week number (1-12)"
        },
        days: {
          type: "array",
          minItems: input.training_frequency_preference,
          maxItems: input.training_frequency_preference,
          description: `Array of ${input.training_frequency_preference} training days`,
          items: {
            type: "object",
            required: ["day_number", "focus", "exercises"],
            properties: {
              day_number: { 
                type: "integer", 
                minimum: 1,
                description: "Day number within the week (1-7)"
              },
              focus: { 
                type: "string",
                description: "The focus of this training day (e.g., 'Upper Body', 'Push', 'Legs')"
              },
              exercises: {
                type: "array",
                description: "Array of exercises for this day",
                items: {
                  type: "object",
                  required: ["id", "name", "sets", "reps", "rpe", "tempo", "rest_seconds"],
                  properties: {
                    id: { 
                      type: "string",
                      description: "Unique exercise identifier"
                    },
                    name: { 
                      type: "string",
                      description: "Exercise name (e.g., 'Barbell Bench Press')"
                    },
                    sets: { 
                      type: "integer", 
                      minimum: 1, 
                      maximum: 8,
                      description: "Number of sets"
                    },
                    reps: { 
                      type: "string",
                      description: "Rep range (e.g., '8-12' or '10')"
                    },
                    rpe: { 
                      type: "number", 
                      minimum: 5, 
                      maximum: 10,
                      description: "Rate of Perceived Exertion (5-10 scale)"
                    },
                    tempo: { 
                      type: "string",
                      description: "Tempo notation (e.g., '2-1-2-1' or empty string)"
                    },
                    rest_seconds: { 
                      type: "integer", 
                      minimum: 30, 
                      maximum: 300,
                      description: "Rest time in seconds"
                    },
                    intensity_pct: { 
                      type: "number", 
                      minimum: 0.4, 
                      maximum: 0.9,
                      description: "Optional intensity percentage"
                    }
                  }
                }
              },
              notes: { 
                type: "string",
                description: "Optional notes for this training day"
              }
            }
          }
        }
      }
    };

    const userProfile = buildUserProfile(input);
    
    const weekPrompt = `You are an expert strength coach creating detailed workout programming. Generate a complete week of training that aligns with the provided high-level plan.

CRITICAL REQUIREMENTS:
- Follow the exact focus and notes from the high-level plan
- Create ${input.training_frequency_preference} training days
- Ensure proper exercise progression and selection
- Respect user's equipment, injuries, and preferences
- Follow evidence-based programming principles
- Use appropriate rep ranges: main lifts 6-12 reps, accessories 8-20 reps
- Set RPE appropriately for the week's focus
- All exercises use 180 seconds rest (3 minutes)

Week Focus: "${highLevelWeek.focus}"
Week Notes: "${highLevelWeek.notes}"
Week Number: ${highLevelWeek.week_number}

User Profile: ${userProfile}

EXERCISE SELECTION GUIDELINES:
- Prioritize compound movements first
- Include appropriate accessories based on focus
- Respect available equipment: ${(input.equipment_available ?? []).join(', ') || 'Full gym'}
- Avoid exercises that conflict with injuries: ${(input.injuries ?? []).join(', ') || 'None'}
- Session length: ${input.session_length_min} minutes (affects exercise count)

PROGRESSION NOTES:
- Week ${highLevelWeek.week_number} of 12-week program
- Consider 3:1 accumulation-to-deload pattern
- Adjust volume/intensity based on week focus
- Deload weeks should reduce sets by ~40%

Generate a complete week following the exact schema provided.`;

    const response = await client.chat.completions.create({
      model: modelName,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a professional strength coach. Use the generate_week_plan tool to create a detailed training week that follows evidence-based programming principles.'
        },
        {
          role: 'user',
          content: weekPrompt
        }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generate_week_plan',
            description: 'Generate a detailed training week with specific exercises, sets, reps, and programming',
            parameters: weekSchema
          }
        }
      ],
      tool_choice: 'required'
    });

    // Extract the tool call result
    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.type !== 'function' || toolCall.function.name !== 'generate_week_plan') {
      throw new Error('No valid tool call found in response');
    }

    const weekData = JSON.parse(toolCall.function.arguments);
    
    // Validate the returned data structure
    if (!weekData || typeof weekData !== 'object') {
      throw new Error('Invalid week data structure returned');
    }

    // Ensure week_number matches the high-level plan
    weekData.week_number = highLevelWeek.week_number;

    // Apply session constraints and equipment substitutions
    let validatedWeek: Week = weekData as Week;
    
    // Create a temporary program to use existing validation functions
    const tempProgram: Program = {
      program_id: 'temp',
      name: 'temp',
      paid: false,
      weeks: [validatedWeek],
      metadata: { created_at: new Date().toISOString(), source: [], volume_profile: {} }
    };

    // Apply existing constraints and validations
    const processedProgram = applySessionConstraints(tempProgram, input);
    validatedWeek = processedProgram.weeks[0]!;

    return validatedWeek;

  } catch (error) {
    console.error('❌ [generateDetailedWeek] Failed to generate detailed week:', error);
    
    // Check for quota errors and provide fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
      console.log('⚠️ [generateDetailedWeek] Quota exceeded, falling back to deterministic generation');
      
      // Use existing deterministic generation as fallback
      const fallbackWeek = generateDeterministicWeek(input);
      return {
        week_number: highLevelWeek.week_number,
        days: fallbackWeek.days
      };
    }
    
    throw new Error(`Detailed week generation failed: ${errorMessage}. Please try again.`);
  }
}


