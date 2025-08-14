import { NextRequest, NextResponse } from 'next/server';
import { OnboardingInput, generateFullProgram, refineWithGPT, generateProgramWithLLM } from '@/lib/program-generator';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import programSchema from '@/types/program.schema.json';
import { getServiceSupabaseClient } from '@/lib/supabase-server';
import type { Program } from '@/types/program';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
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
  const programId = body.programId ?? crypto.randomUUID();
  
  // Derive authenticated user on the server; prefer cookies but also support Authorization: Bearer <token>
  const cookieStore = cookies();
  let user: any = null;
  try {
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          }
        }
      }
    );
    const { data: auth } = await authClient.auth.getUser();
    user = auth?.user ?? null;
  } catch {}

  if (!user) {
    try {
      const bearer = req.headers.get('authorization') ?? req.headers.get('Authorization');
      const token = bearer?.toLowerCase().startsWith('bearer ')
        ? bearer.slice(7)
        : undefined;
      if (token) {
        const direct = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } as any }
        );
        const { data: auth } = await direct.auth.getUser();
        user = auth?.user ?? null;
      }
    } catch {}
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let program: Program;
  if (gpt) {
    program = await generateProgramWithLLM(input, { programId, citations: body.citations ?? [] });
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
    const { isAllowedAndConsume } = await import('@/lib/rate-limit');
    const ok = await isAllowedAndConsume({ key, limit: 5, windowSeconds: 60 });
    if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  } catch {}
  const supabase = getServiceSupabaseClient();
  await supabase.from('programs').upsert({ id: program.program_id, user_id: user.id, name: program.name, data: program, paid: program.paid ?? false });
  return NextResponse.json(program, { status: 201 });
}


