export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  tempo: string;
  rest_seconds: number;
  intensity_pct?: number | null;
};

export type Day = {
  day_number: number;
  focus: string;
  exercises: Exercise[];
  notes?: string | null;
};

export type Week = {
  week_number: number;
  days: Day[];
};

export type Program = {
  program_id: string;
  name: string;
  paid: boolean;
  weeks: Week[];
  metadata: Record<string, unknown>;
};


