import { NextRequest, NextResponse } from 'next/server';
import { OnboardingInput, generateFullProgram, generateProgramWithLLM } from '@/lib/core/program-generator';
import Ajv, { type Schema } from 'ajv';
import addFormats from 'ajv-formats';
import programSchema from '@/types/program.schema.json';
import { getServiceSupabaseClient } from '@/lib/integrations/supabase-server';
import type { Program } from '@/types/program';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateProgram = ajv.compile(programSchema as Schema);

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
  const programId = body.programId ?? crypto.randomUUID();
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = session.user;
  let program: Program;
  if (gpt) {
    program = await generateProgramWithLLM(input, { programId, citations: body.citations ?? [], userId: user.id });
  } else {
    const base: Program = {
      program_id: programId,
      name: '12-week Hypertrophy Program',
      paid: false,
      weeks: generateFullProgram(input),
      metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {} }
    };
    program = base;
  }
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
    const { isAllowedAndConsume } = await import('@/lib/utils/rate-limit');
    const ok = await isAllowedAndConsume({ key, limit: 5, windowSeconds: 60 });
    if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  } catch {}
  const serviceSupabase = getServiceSupabaseClient();
  await serviceSupabase.from('programs').upsert({ id: program.program_id, user_id: user.id, name: program.name, data: program, paid: program.paid ?? false });
  return NextResponse.json(program, { status: 201 });
}


