export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type Big3PRs = {
  bench?: number | null;
  squat?: number | null;
  deadlift?: number | null;
};

type BaseLift = 'bench' | 'squat' | 'deadlift';

type AccessoryMap = {
  pattern: RegExp;
  base: BaseLift;
  ratioLow: number;
  ratioHigh: number;
};

const ACCESSORY_MAPPINGS: AccessoryMap[] = [
  // Main lifts (provide range using 80–85% of 1RM)
  { pattern: /barbell\s+bench\s+press/i, base: 'bench', ratioLow: 1.0, ratioHigh: 1.0 },
  { pattern: /barbell\s+back\s+squat/i, base: 'squat', ratioLow: 1.0, ratioHigh: 1.0 },
  { pattern: /(conventional\s+)?deadlift/i, base: 'deadlift', ratioLow: 1.0, ratioHigh: 1.0 },

  // Presses
  { pattern: /\b(barbell\s+)?overhead\s+press\b|^standing\s+overhead\s+press$/i, base: 'bench', ratioLow: 0.55, ratioHigh: 0.65 },
  { pattern: /dumbbell.*(overhead|shoulder)\s+press/i, base: 'bench', ratioLow: 0.40, ratioHigh: 0.50 },
  { pattern: /incline\s+barbell\s+(press|bench)/i, base: 'bench', ratioLow: 0.65, ratioHigh: 0.75 },
  { pattern: /incline\s+dumbbell\s+(press|bench)/i, base: 'bench', ratioLow: 0.45, ratioHigh: 0.55 },
  { pattern: /dumbbell\s+bench/i, base: 'bench', ratioLow: 0.75, ratioHigh: 0.85 },
  { pattern: /close[- ]?grip\s+bench/i, base: 'bench', ratioLow: 0.80, ratioHigh: 0.90 },
  { pattern: /\bdips?\b/i, base: 'bench', ratioLow: 0.50, ratioHigh: 0.60 },
  { pattern: /triceps?.*pushdown/i, base: 'bench', ratioLow: 0.35, ratioHigh: 0.45 },
  { pattern: /(overhead\s+)?triceps?.*extension/i, base: 'bench', ratioLow: 0.30, ratioHigh: 0.40 },
  { pattern: /cable\s+tricep\s+kickback/i, base: 'bench', ratioLow: 0.15, ratioHigh: 0.25 },

  // Pull rows/pulls
  { pattern: /\bbarbell\s+row\b|chest[- ]supported\s+row|\brow\b/i, base: 'deadlift', ratioLow: 0.45, ratioHigh: 0.55 },
  { pattern: /pendlay\s+row/i, base: 'deadlift', ratioLow: 0.40, ratioHigh: 0.50 },
  { pattern: /dumbbell\s+row/i, base: 'deadlift', ratioLow: 0.35, ratioHigh: 0.45 },
  { pattern: /pull[- ]?up/i, base: 'deadlift', ratioLow: 0.35, ratioHigh: 0.45 },
  { pattern: /lat\s+pull\s*down/i, base: 'deadlift', ratioLow: 0.45, ratioHigh: 0.55 },
  { pattern: /face\s+pull/i, base: 'deadlift', ratioLow: 0.20, ratioHigh: 0.30 },

  // Squat variants & single-leg
  { pattern: /front\s+squat/i, base: 'squat', ratioLow: 0.70, ratioHigh: 0.80 },
  { pattern: /bulgarian.*split.*squat/i, base: 'squat', ratioLow: 0.35, ratioHigh: 0.45 },
  { pattern: /walking\s+lunge/i, base: 'squat', ratioLow: 0.30, ratioHigh: 0.40 },

  // Hip hinge & posterior
  { pattern: /(romanian\s+deadlift|\brdl\b)/i, base: 'deadlift', ratioLow: 0.60, ratioHigh: 0.70 },
  { pattern: /hip\s+thrust/i, base: 'deadlift', ratioLow: 0.80, ratioHigh: 0.90 },

  // Machine legs
  { pattern: /leg\s+press/i, base: 'squat', ratioLow: 1.80, ratioHigh: 2.20 },
  { pattern: /leg\s+extension/i, base: 'squat', ratioLow: 0.35, ratioHigh: 0.45 },
  { pattern: /leg\s+curl|lying\s+leg\s+curl|hamstring\s+curl/i, base: 'deadlift', ratioLow: 0.30, ratioHigh: 0.40 },

  // Arms & shoulders
  { pattern: /(biceps?|ez).*bar.*curl|^ez\s+bar\s+curl$/i, base: 'bench', ratioLow: 0.25, ratioHigh: 0.35 },
  { pattern: /dumbbell\s+curl/i, base: 'bench', ratioLow: 0.15, ratioHigh: 0.25 },
  { pattern: /hammer\s+curl/i, base: 'bench', ratioLow: 0.15, ratioHigh: 0.25 },
  { pattern: /lateral\s+raise/i, base: 'bench', ratioLow: 0.08, ratioHigh: 0.12 },
  { pattern: /shrugs?\s*\(barbell\)|barbell\s+shrugs?/i, base: 'deadlift', ratioLow: 0.60, ratioHigh: 0.70 },
  { pattern: /shrugs?\s*\(dumbbell\)|dumbbell\s+shrugs?/i, base: 'deadlift', ratioLow: 0.35, ratioHigh: 0.45 },
];

function pickRatioForExperience(low: number, high: number, experience: ExperienceLevel): number {
  // Requirement: use HIGH end for Intermediate and Advanced; use MID for Beginner
  if (experience === 'Beginner') return (low + high) / 2;
  return high;
}

function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

function findAccessoryMapping(exerciseName: string): AccessoryMap | null {
  for (const m of ACCESSORY_MAPPINGS) {
    if (m.pattern.test(exerciseName)) return m;
  }
  return null;
}

export function computeSuggestedWorkingWeight(
  exerciseName: string,
  prs: Big3PRs,
  experience: ExperienceLevel = 'Intermediate'
): number | null {
  const mapping = findAccessoryMapping(exerciseName);
  if (!mapping) return null;

  const base1RM = mapping.base === 'bench' ? prs.bench : mapping.base === 'squat' ? prs.squat : prs.deadlift;
  if (!base1RM || base1RM <= 0) return null;

  const ratio = pickRatioForExperience(mapping.ratioLow, mapping.ratioHigh, experience);
  const accessory1RM = base1RM * ratio;

  // Use 0.82 multiplier universally per requirement
  const workingPercent = 0.82;
  const raw = accessory1RM * workingPercent;

  // Round to nearest 5 lbs for practicality
  return roundToIncrement(raw, 5);
}

export function describeBasis(exerciseName: string): { base: BaseLift; ratioRange: [number, number] } | null {
  const mapping = findAccessoryMapping(exerciseName);
  if (!mapping) return null;
  return { base: mapping.base, ratioRange: [mapping.ratioLow, mapping.ratioHigh] };
}

export function computeSuggestedWorkingWeightRange(
  exerciseName: string,
  prs: Big3PRs
): { low: number; high: number; perHand: boolean } | null {
  const mapping = findAccessoryMapping(exerciseName);
  if (!mapping) return null;
  const base1RM = mapping.base === 'bench' ? prs.bench : mapping.base === 'squat' ? prs.squat : prs.deadlift;
  if (!base1RM || base1RM <= 0) return null;

  // Main lifts: show 80–85% range of the base 1RM
  if (mapping.ratioLow === 1 && mapping.ratioHigh === 1) {
    const low = roundToIncrement(base1RM * 0.80, 5);
    const high = roundToIncrement(base1RM * 0.85, 5);
    return { low, high, perHand: /dumbbell|db|\beach\b/i.test(exerciseName) };
  }

  const ratioLow = mapping.ratioLow;
  const ratioHigh = mapping.ratioHigh;
  const workingPercent = 0.82;
  const low = roundToIncrement(base1RM * ratioLow * workingPercent, 5);
  const high = roundToIncrement(base1RM * ratioHigh * workingPercent, 5);
  return { low: Math.min(low, high), high: Math.max(low, high), perHand: /dumbbell|db|\beach\b/i.test(exerciseName) };
}


