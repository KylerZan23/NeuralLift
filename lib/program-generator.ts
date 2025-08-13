import { z } from 'zod';

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

export function generateDeterministicWeek(input: OnboardingInput) {
  const exp = input.experience_level;
  const basePct = exp === 'Beginner' ? 0.65 : exp === 'Intermediate' ? 0.72 : 0.75;
  const restCompound = 120;
  const restAccessory = input.rest_pref === 'custom' ? 75 : 90;

  const bpPct = Math.min(0.8, basePct);
  const sqPct = Math.min(0.78, basePct);
  const dlPct = Math.min(0.8, basePct);

  const day1: Exercise[] = [
    { id: 'bp-01', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: bpPct },
    { id: 'ohp-01', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
    { id: 'incl-01', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
    { id: 'fly-01', name: 'Cable Fly', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
    { id: 'tri-01', name: 'Overhead Triceps Extension', sets: 3, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
  ];

  const day2: Exercise[] = [
    { id: 'sq-01', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: sqPct },
    { id: 'rdl-01', name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 8, tempo: '3-0-1', rest_seconds: restCompound },
    { id: 'legp-01', name: 'Leg Press', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
    { id: 'ext-01', name: 'Leg Extension', sets: 2, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
    { id: 'calf-01', name: 'Seated Calf Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
  ];

  const day3: Exercise[] = [
    { id: 'row-01', name: 'Barbell Row', sets: 4, reps: '6-10', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound },
    { id: 'pull-01', name: 'Lat Pulldown', sets: 3, reps: '8-12', rpe: 8, tempo: '2-0-1', rest_seconds: restAccessory },
    { id: 'face-01', name: 'Face Pull', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
    { id: 'curl-01', name: 'EZ Bar Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
  ];

  const day4: Exercise[] = [
    { id: 'dl-01', name: 'Conventional Deadlift', sets: 3, reps: '5-6', rpe: 7, tempo: '2-0-1', rest_seconds: 180, intensity_pct: dlPct },
    { id: 'fsq-01', name: 'Front Squat', sets: 3, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
    { id: 'curl-02', name: 'Lying Leg Curl', sets: 3, reps: '10-12', rpe: 8, tempo: '2-1-1', rest_seconds: 90 },
    { id: 'abs-01', name: 'Cable Crunch', sets: 3, reps: '10-15', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
  ];

  const day5: Exercise[] = [
    { id: 'bp-02', name: 'Close-Grip Bench Press', sets: 3, reps: '6-8', rpe: 7, tempo: '2-0-1', rest_seconds: restCompound, intensity_pct: Math.max(0.68, bpPct - 0.03) },
    { id: 'ohp-02', name: 'Standing Overhead Press', sets: 3, reps: '6-8', rpe: 8, tempo: '2-0-1', rest_seconds: restCompound },
    { id: 'lat-01', name: 'Lateral Raise', sets: 3, reps: '12-15', rpe: 8, tempo: '2-1-1', rest_seconds: 60 },
    { id: 'dip-01', name: 'Cable Triceps Pushdown', sets: 3, reps: '10-12', rpe: 8, tempo: '2-0-1', rest_seconds: 60 },
  ];

  return {
    week_number: 1,
    days: [
      { day_number: 1, focus: 'Upper — Push', exercises: day1, notes: 'Add 2.5–5 lb if last set ≤ RPE 7 for 2 sessions.' },
      { day_number: 2, focus: 'Lower — Squat focus', exercises: day2 },
      { day_number: 3, focus: 'Upper — Pull', exercises: day3 },
      { day_number: 4, focus: 'Lower — Deadlift focus', exercises: day4 },
      { day_number: 5, focus: 'Upper — Chest/Delts bias', exercises: day5, notes: 'Optional rear delt work if recovered.' },
    ]
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

    let plannedDays = baseWeek.days.slice(0, Math.min(daysPerWeek, 6));
    if (daysPerWeek === 2) {
      plannedDays = [
        { ...baseWeek.days[0], focus: 'Full body A' },
        { ...baseWeek.days[1], focus: 'Full body B' }
      ];
    } else if (daysPerWeek === 3) {
      plannedDays = [
        { ...baseWeek.days[0], focus: 'Upper' },
        { ...baseWeek.days[1], focus: 'Lower' },
        { ...baseWeek.days[2], focus: 'Full body' }
      ];
    } else if (daysPerWeek === 4) {
      plannedDays = [
        { ...baseWeek.days[0], focus: 'Upper 1' },
        { ...baseWeek.days[1], focus: 'Lower 1' },
        { ...baseWeek.days[2], focus: 'Upper 2' },
        { ...baseWeek.days[3], focus: 'Lower 2' }
      ];
    } else if (daysPerWeek === 5) {
      plannedDays = [
        { ...baseWeek.days[0], focus: 'Push' },
        { ...baseWeek.days[2], focus: 'Pull' },
        { ...baseWeek.days[3], focus: 'Legs' },
        { ...baseWeek.days[1], focus: 'Upper' },
        { ...baseWeek.days[4], focus: 'Lower' }
      ];
    } else if (daysPerWeek === 6) {
      const focus = input.focus_point ?? 'Arms';
      plannedDays = [
        { ...baseWeek.days[0], focus: 'Push' },
        { ...baseWeek.days[2], focus: 'Pull' },
        { ...baseWeek.days[3], focus: 'Legs' },
        { ...baseWeek.days[1], focus: 'Upper' },
        { ...baseWeek.days[4], focus: 'Lower' },
        { ...baseWeek.days[2], focus: `Focus — ${focus}` }
      ];
    }

    const adjustedDays = plannedDays.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => {
        const sets = Math.max(1, Math.round(ex.sets * volumeMultiplier));
        const intensity_pct = ex.intensity_pct != null ? Math.max(0.5, Math.min(0.9, (ex.intensity_pct + intensityBump))) : undefined;
        return { ...ex, sets, intensity_pct };
      })
    }));

    weeks.push({ week_number: w, days: adjustedDays });
  }
  return weeks;
}

export async function refineWithGPT(baseProgram: any, citations: string[]) {
  if (!process.env.OPENAI_API_KEY) return baseProgram;
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `You are a strength coach. Refine the provided 12-week hypertrophy program JSON by adding microprogression notes, deload adjustments (3:1), and safe swaps respecting injuries/equipment. Return valid JSON only. Citations: ${citations.join(', ')}`;
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
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

export async function saveProgramToSupabase(program: any) {
  // Deprecated: prefer calling code to perform writes using a service client and handle errors
  throw new Error('saveProgramToSupabase is deprecated. Use server route with service client to persist.');
}

export function canViewWeek(week: number, paid: boolean) {
  return week <= 1 || paid;
}


