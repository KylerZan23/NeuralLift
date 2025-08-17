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
  console.log('🚀 [generate-program] Starting POST request');
  
  // Log incoming request headers
  console.log('📋 [generate-program] Request headers:', {
    authorization: req.headers.get('authorization'),
    cookie: req.headers.get('cookie'),
    'user-agent': req.headers.get('user-agent'),
    origin: req.headers.get('origin'),
    referer: req.headers.get('referer'),
  });

  const body = await req.json();
  const input = OnboardingInput.parse(body.input);
  const gpt = Boolean(body.useGPT);
  const programId = body.programId ?? crypto.randomUUID();
  
  console.log('📦 [generate-program] Request body parsed:', {
    hasInput: !!input,
    useGPT: gpt,
    programId,
  });

  const cookieStore = cookies();
  console.log('🍪 [generate-program] Cookies available:', {
    cookieCount: cookieStore.getAll().length,
    cookieNames: cookieStore.getAll().map(c => c.name),
  });

  const supabase = createClient(cookieStore);
  console.log('⚡ [generate-program] Supabase client created');

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log('🔐 [generate-program] Session check result:', {
    hasSession: !!session,
    sessionError: sessionError?.message,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    accessToken: session?.access_token ? '***EXISTS***' : 'MISSING',
    refreshToken: session?.refresh_token ? '***EXISTS***' : 'MISSING',
  });

  if (!session) {
    console.error('❌ [generate-program] No session found - returning 401');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('✅ [generate-program] Authentication successful, proceeding with generation');

  const user = session.user;
  console.log('🤖 [generate-program] Starting program generation:', {
    useGPT: gpt,
    userId: user.id,
    programId,
  });

  let program: Program;
  try {
    if (gpt) {
      console.log('🧠 [generate-program] Using LLM for generation');
      program = await generateProgramWithLLM(input, { programId, citations: body.citations ?? [], userId: user.id });
      console.log('✅ [generate-program] LLM generation completed');
    } else {
      console.log('📊 [generate-program] Using deterministic generation');
      const base: Program = {
        program_id: programId,
        name: '12-week Hypertrophy Program',
        paid: false,
        weeks: generateFullProgram(input),
        metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {} }
      };
      program = base;
      console.log('✅ [generate-program] Deterministic generation completed');
    }
  } catch (error) {
    console.error('❌ [generate-program] Program generation failed:', error);
    return NextResponse.json({ error: 'Program generation failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
  console.log('🔍 [generate-program] Preparing program for validation');
  
  // Extract user_id if present (not part of schema) and clean program for validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id, ...programForValidation } = program as Program & { user_id?: string };
  
  // Ensure all required fields are properly typed for schema validation
  const cleanedProgram = {
    ...programForValidation,
    weeks: programForValidation.weeks?.map((week) => ({
      ...week,
      days: week.days?.map((day) => ({
        ...day,
        notes: day.notes || "", // Ensure notes is string, not null
        exercises: day.exercises?.map((exercise) => ({
          ...exercise,
          intensity_pct: exercise.intensity_pct ? Number(exercise.intensity_pct) : undefined, // Ensure number type
          rpe: Number(exercise.rpe), // Ensure number type
          sets: Number(exercise.sets), // Ensure number type
          rest_seconds: Number(exercise.rest_seconds), // Ensure number type
        }))
      }))
    }))
  };

  console.log('🔍 [generate-program] Validating program schema');
  // Validate program against JSON schema before saving
  const valid = validateProgram(cleanedProgram);
  if (!valid) {
    console.error('❌ [generate-program] Schema validation failed:', validateProgram.errors);
    return NextResponse.json({ error: 'Invalid program payload', details: validateProgram.errors }, { status: 400 });
  }
  console.log('✅ [generate-program] Schema validation passed');
  
  // Use the cleaned program for further processing
  program = cleanedProgram as Program;

  // Simple in-memory rate limit per IP per minute (best-effort; for production use Upstash Redis)
  console.log('🚦 [generate-program] Checking rate limits');
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const key = `gen:${ip}:${new Date().getUTCMinutes()}`;
    RateLimitSchema.parse({ ip, key });
    const { isAllowedAndConsume } = await import('@/lib/utils/rate-limit');
    const ok = await isAllowedAndConsume({ key, limit: 5, windowSeconds: 60 });
    if (!ok) {
      console.error('❌ [generate-program] Rate limit exceeded');
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    console.log('✅ [generate-program] Rate limit check passed');
  } catch (rateLimitError) {
    console.error('⚠️ [generate-program] Rate limit check failed, continuing:', rateLimitError);
  }

  console.log('💾 [generate-program] Saving program to database:', {
    programId: program.program_id,
    userId: user.id,
    programName: program.name,
  });
  
  try {
    const serviceSupabase = getServiceSupabaseClient();
    await serviceSupabase.from('programs').upsert({ id: program.program_id, user_id: user.id, name: program.name, data: program, paid: program.paid ?? false });
    console.log('✅ [generate-program] Database save successful');
  } catch (dbError) {
    console.error('❌ [generate-program] Database save failed:', dbError);
    return NextResponse.json({ error: 'Database save failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' }, { status: 500 });
  }
  
  console.log('🎉 [generate-program] Program generation completed successfully');
  return NextResponse.json(program, { status: 201 });
}


