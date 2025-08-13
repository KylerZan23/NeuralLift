import { NextRequest, NextResponse } from 'next/server';
import { OnboardingInput, generateFullProgram, refineWithGPT } from '@/lib/program-generator';
import Ajv from 'ajv';
import programSchema from '@/types/program.schema.json';
import { getServiceSupabaseClient } from '@/lib/supabase-server';
import type { Program } from '@/types/program';
import { z } from 'zod';

const ajv = new Ajv({ allErrors: true, strict: false });
const validateProgram = ajv.compile(programSchema as any);

const RateLimitSchema = z.object({
  ip: z.string().min(1),
  key: z.string().min(1)
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') ?? 'demo';
  const input = OnboardingInput.parse({
    experience_level: 'Intermediate',
    training_frequency_preference: 5,
    equipment_available: ['Gym'],
    big3_PRs: { bench: 185, squat: 185, deadlift: 225 },
    preferred_split: undefined,
    session_length_min: 60
  });

  const weeks = generateFullProgram(input);
  const program: Program = {
    program_id: id,
    name: '12-week Hypertrophy Program',
    paid: false,
    weeks,
    metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {} }
  };

  return NextResponse.json(program, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const input = OnboardingInput.parse(body.input);
  const gpt = Boolean(body.useGPT);
  const base: Program = {
    program_id: body.programId ?? crypto.randomUUID(),
    name: '12-week Hypertrophy Program',
    paid: false,
    weeks: generateFullProgram(input),
    metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {} }
  };

  const program: Program = gpt ? await refineWithGPT(base, body.citations ?? []) : base;
  // Validate program against JSON schema before saving
  const valid = validateProgram(program);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid program payload', details: validateProgram.errors }, { status: 400 });
  }

  // Simple in-memory rate limit per IP per minute (best-effort; for production use Upstash Redis)
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const key = `gen:${ip}:${new Date().getUTCMinutes()}`;
    RateLimitSchema.parse({ ip, key });
    ;(global as any).__GEN_RATE__ = (global as any).__GEN_RATE__ ?? new Map<string, number>();
    const map: Map<string, number> = (global as any).__GEN_RATE__;
    const count = (map.get(key) ?? 0) + 1;
    map.set(key, count);
    if (count > 5) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  } catch {}
  const supabase = getServiceSupabaseClient();
  await supabase.from('programs').upsert({ id: program.program_id, user_id: body.userId ?? null, name: program.name, data: program, paid: program.paid ?? false });
  return NextResponse.json(program, { status: 201 });
}


