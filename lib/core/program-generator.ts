import { z } from 'zod';
import Ajv, { type ErrorObject, type Schema } from 'ajv';
import addFormats from 'ajv-formats';
import programSchema from '@/types/program.schema.json';
import type { Program, Day } from '@/types/program';
import OpenAI from 'openai';

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

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateProgram = ajv.compile(programSchema as Schema);

function coerceProgramId(p: Program, programId: string): Program {
  if (!p || typeof p !== 'object') return p;
  p.program_id = programId;
  return p;
}

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



async function repairWithModel(raw: string, errors: ErrorObject[]): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      stream: false, // Ensure this line is added
      messages: [
        { role: 'system', content: 'You return strictly valid JSON matching the provided schema. No prose.' },
        { role: 'user', content: `Fix this program JSON to pass the schema. Only return corrected JSON.\nErrors:\n${JSON.stringify(errors)}\nJSON:\n${raw}` }
      ]
    } as OpenAI.Chat.ChatCompletionCreateParams);
    
    // Check if it's a non-streaming response
    if ('choices' in response) {
      const text = response.choices?.[0]?.message?.content;
      return text ?? null;
    }
    return null;
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
    `PRs (lbs): bench=${pr.bench ?? 'n/a'}, squat=${pr.squat ?? 'n/a'}, deadlift=${pr.deadlift ?? 'n/a'}.`,
    `Injuries: ${inj || 'none'}.`,
    `Movement prefs: ${prefs || 'none'}.`,
    focus
  ].join(' ');
}

const systemPrompt = `
You are an expert evidence-based strength coach specializing in hypertrophy training. Generate a comprehensive 12-week program as strict JSON conforming to the given schema. Return ONLY valid JSON.

MANDATORY CONSTRAINTS (NEVER VIOLATE):
- 12 weeks total; training days per week based on user preference (2-6 days)
- Exercise hierarchy: compound movements first, compound variations second, accessories last
- Weekly effective sets per muscle group by experience level:
  * Beginner: 10-14 sets
  * Intermediate: 14-18 sets  
  * Advanced: 18-26 sets
- Rep ranges STRICTLY: main lifts 6-12 reps (emphasis 8-12); accessories 8-20 reps
- Progressive overload: 3:1 accumulation-to-deload cycle (weeks 1-3 accumulate, week 4 deload)
- Deload weeks: reduce sets by ~40% and intensity
- RPE scale: 5-10 (displayed as RIR 0-5 in UI)
- Rest periods: 180 seconds for ALL exercises
- Session constraints: 30min→4 exercises, 45min→5 exercises, 60min→6 exercises, 90min→7 exercises

EXERCISE SELECTION RULES:
- Prioritize barbell, dumbbell, and cable movements over machines
- Avoid high-risk exercises for beginners
- Substitute exercises based on available equipment
- Respect injury limitations and movement preferences
- Include compound movements: squat, deadlift, bench press, overhead press, rows
- Balance muscle groups across the week

SPLIT RECOMMENDATIONS:
- 2 days: Full body both sessions
- 3 days: Upper/Lower/Full body
- 4 days: Upper/Lower/Upper/Lower
- 5 days: Push/Pull/Legs/Upper/Lower
- 6 days: Push/Pull/Legs/Upper/Lower/Focus

PERSONALIZATION REQUIREMENTS:
- Consider user's experience level for exercise complexity
- Adapt volume based on training frequency
- Account for session length constraints
- Tailor exercises to available equipment
- Avoid contraindicated movements for injuries
- Focus on user's preferred muscle groups when specified

PROGRESSION STRATEGY:
- Week 1: Baseline intensity and volume
- Week 2: Slight increase in volume or intensity
- Week 3: Peak accumulation week
- Week 4: Deload (reduce sets by 40%, maintain weight)
- Repeat cycle for weeks 5-8 and 9-12
- Progressive overload through increased weight, reps, or sets

EXERCISE NOTES:
- Provide technique cues for compound movements
- Include progression strategies
- Mention tempo when relevant (e.g., "2-1-2-1")
- Keep notes concise and actionable

METADATA REQUIREMENTS:
- Source: Include research references and evidence-based practitioners
- Volume profile: Calculate weekly sets per muscle group
- Created timestamp: Use ISO format
- Track user's PRs and experience level in metadata

SCIENTIFIC BASIS:
- Follow Schoenfeld volume recommendations
- Apply progressive overload principles
- Use autoregulated RPE for intensity prescription
- Implement evidence-based exercise selection
- Respect recovery needs and adaptation timelines

CRITICAL JSON SCHEMA REQUIREMENTS:
- MUST generate ALL 12 weeks (exactly 12 week objects in "weeks" array)
- ALL fields must be exactly as specified below
- "paid" MUST be boolean (true/false), never string
- "week_number" MUST be integer 1-12 
- "day_number" MUST be integer 1-7
- "sets" MUST be integer (1-8), never string
- "rpe" MUST be integer (5-10), never string
- "rest_seconds" MUST be exactly 180 (integer)
- "reps" MUST be string format like "8-12" or "10"
- "tempo" MUST be string (can be empty "")
- "notes" MUST be string (use "" for empty, never null)
- "created_at" MUST be ISO format: "2025-01-01T00:00:00.000Z"
- "source" MUST be array of strings
- "volume_profile" MUST be object (can be empty {})
- "big3_prs" MUST be object (can be empty {})
- DO NOT include "user_id" field anywhere

EXACT OUTPUT FORMAT (generate ALL 12 weeks like this):
{
  "program_id": "string",
  "name": "string", 
  "paid": false,
  "weeks": [
    {
      "week_number": 1,
      "days": [
        {
          "day_number": 1,
          "focus": "Upper Body",
          "notes": "",
          "exercises": [
            {
              "id": "bench-press-001",
              "name": "Barbell Bench Press",
              "sets": 4,
              "reps": "6-8",
              "rpe": 7,
              "tempo": "",
              "rest_seconds": 180
            }
          ]
        }
      ]
    },
    {
      "week_number": 2,
      "days": [
        {
          "day_number": 1,
          "focus": "Upper Body",
          "notes": "",
          "exercises": [
            {
              "id": "bench-press-002",
              "name": "Barbell Bench Press",
              "sets": 4,
              "reps": "6-8",
              "rpe": 7,
              "tempo": "",
              "rest_seconds": 180
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "created_at": "2025-08-19T06:00:00.000Z",
    "source": ["Schoenfeld", "Jeff Nippard", "Mike Israetel"],
    "volume_profile": {},
    "big3_prs": {},
    "experience_level": "Intermediate"
  }
}

IMPORTANT: The "weeks" array MUST contain exactly 12 week objects (week_number 1 through 12). Do not generate only 1 week!
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
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userProfile = buildUserProfile(input);
    const citations = opts?.citations ?? ['Schoenfeld', 'Nuckols', 'Jeff Nippard', 'Mike Israetel', 'Helms'];

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      stream: false, // Ensure this line is added
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User profile:\n${userProfile}\nProgram id: ${programId}\nCitations to include in metadata.source: ${citations.join(', ')}` }
      ]
    } as OpenAI.Chat.ChatCompletionCreateParams);

    // Check if it's a non-streaming response
    if (!('choices' in response)) {
      throw new Error('Received streaming response when expecting non-streaming');
    }

    const text = response.choices?.[0]?.message?.content ?? '';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd <= jsonStart) throw new Error('No JSON in response');
    // Attempt to parse and validate the AI response
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Program;
        let prepared = ensureMetadata(coerceProgramId(parsed, programId));
        if (opts?.userId) prepared.user_id = opts.userId;
        prepared.metadata = {
          ...prepared.metadata,
          big3_prs: input.big3_PRs ?? {},
          experience_level: input.experience_level
        };
        prepared = enforceDaysSplit(prepared, input);
        prepared = applySessionConstraints(prepared, input);
        
        // Clean program for schema validation (remove user_id and fix notes)
        const { user_id: _, ...cleanProgram } = prepared as Program & { user_id?: string };
        const schemaValidProgram = {
          ...cleanProgram,
          weeks: cleanProgram.weeks?.map(week => ({
            ...week,
            days: week.days?.map(day => ({
              ...day,
              notes: day.notes ?? "" // Schema expects string, not null
            }))
          }))
        };
        
        // Validate the program against schema
        const isValid = validateProgram(schemaValidProgram);
        if (isValid) {
          // Return the original program with user_id for further processing
          return prepared as Program;
        }
        
        // If validation fails, try to repair
        console.log(`⚠️ [generateProgramWithLLM] Validation failed on attempt ${attempts + 1}, trying repair...`);
        console.log(`🔍 [generateProgramWithLLM] Validation errors:`, JSON.stringify(validateProgram.errors, null, 2));
        const repaired = await repairWithModel(JSON.stringify(prepared), validateProgram.errors ?? []);
        if (repaired) {
          const reparsed = JSON.parse(repaired) as Program;
          let final = ensureMetadata(coerceProgramId(reparsed, programId));
          if (opts?.userId) final.user_id = opts.userId;
          final = enforceDaysSplit(final, input);
          final = applySessionConstraints(final, input);
          final.metadata = {
            ...final.metadata,
            big3_prs: input.big3_PRs ?? {},
            experience_level: input.experience_level
          };
          
          // Clean repaired program for validation  
          const { user_id: __, ...cleanRepaired } = final as Program & { user_id?: string };
          const schemaValidRepaired = {
            ...cleanRepaired,
            weeks: cleanRepaired.weeks?.map(week => ({
              ...week,
              days: week.days?.map(day => ({
                ...day,
                notes: day.notes ?? "" // Schema expects string, not null
              }))
            }))
          };
          
          // Validate repaired program
          const isRepairedValid = validateProgram(schemaValidRepaired);
          if (isRepairedValid) {
            console.log(`✅ [generateProgramWithLLM] Successfully repaired program on attempt ${attempts + 1}`);
            return final as Program;
          }
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          console.log(`❌ [generateProgramWithLLM] Failed after ${maxAttempts} attempts, falling back to deterministic generation`);
          const weeks = generateFullProgram(input);
          const fallback: Program = {
            program_id: programId,
            name: '12-week Hypertrophy Program (Validation Fallback)',
            paid: false,
            weeks,
            metadata: { 
              created_at: new Date().toISOString(), 
              source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], 
              volume_profile: {}, 
              big3_prs: input.big3_PRs ?? {}, 
              experience_level: input.experience_level,
              fallback_reason: 'AI validation failed'
            }
          } as Program;
          if (opts?.userId) fallback.user_id = opts.userId;
          return fallback;
        }
        
      } catch (parseError) {
        attempts++;
        console.log(`⚠️ [generateProgramWithLLM] Parse error on attempt ${attempts}: ${parseError}`);
        if (attempts >= maxAttempts) {
          console.log(`❌ [generateProgramWithLLM] Parse failed after ${maxAttempts} attempts, falling back to deterministic generation`);
          const weeks = generateFullProgram(input);
          const fallback: Program = {
            program_id: programId,
            name: '12-week Hypertrophy Program (Parse Fallback)',
            paid: false,
            weeks,
            metadata: { 
              created_at: new Date().toISOString(), 
              source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], 
              volume_profile: {}, 
              big3_prs: input.big3_PRs ?? {}, 
              experience_level: input.experience_level,
              fallback_reason: 'AI parsing failed'
            }
          } as Program;
          if (opts?.userId) fallback.user_id = opts.userId;
          return fallback;
        }
      }
    }
  } catch (error) {
    console.error('❌ [generateProgramWithLLM] AI generation failed:', error);
    
    // Check if it's a quota/billing error and provide fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('insufficient_quota')) {
      console.log('⚠️ [generateProgramWithLLM] Quota exceeded, falling back to deterministic generation');
      const weeks = generateFullProgram(input);
      const fallback: Program = {
        program_id: programId,
        name: '12-week Hypertrophy Program (Fallback)',
        paid: false,
        weeks,
        metadata: { 
          created_at: new Date().toISOString(), 
          source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], 
          volume_profile: {}, 
          big3_prs: input.big3_PRs ?? {}, 
          experience_level: input.experience_level,
          fallback_reason: 'OpenAI quota exceeded'
        }
      } as Program;
      if (opts?.userId) fallback.user_id = opts.userId;
      return fallback;
    }
    
    throw new Error(`AI program generation failed: ${errorMessage}. Please try again.`);
  }
  
  // This should never be reached due to the throw statements above
  throw new Error('Failed to generate program after all attempts');
}

export async function saveProgramToSupabase(): Promise<void> {
  // Deprecated: prefer calling code to perform writes using a service client and handle errors
  throw new Error('saveProgramToSupabase is deprecated. Use server route with service client to persist.');
}

export function canViewWeek(week: number, paid: boolean) {
  return week <= 1 || paid;
}


