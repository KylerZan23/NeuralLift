import { NextRequest, NextResponse } from 'next/server';
import { OnboardingInput, generateFullProgram, refineWithGPT } from '@/lib/program-generator';
import Ajv from 'ajv';
import programSchema from '@/types/program.schema.json';
import { getServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') ?? 'demo';
  const input = OnboardingInput.parse({
    experience_level: 'Intermediate',
    training_frequency_preference: 5,
    equipment_available: ['Gym'],
    big3_PRs: { bench: 185, squat: 185, deadlift: 225 },
    preferred_split: 'Push/Pull/Legs',
    session_length_min: 60
  });

  const weeks = generateFullProgram(input);
  const program = {
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
  const base = {
    program_id: body.programId ?? crypto.randomUUID(),
    name: '12-week Hypertrophy Program',
    paid: false,
    weeks: generateFullProgram(input),
    metadata: { created_at: new Date().toISOString(), source: ['science-refs', 'Jeff Nippard', 'TNF', 'Mike Israetel'], volume_profile: {} }
  };

  const program = gpt ? await refineWithGPT(base, body.citations ?? []) : base;
  // Validate program against JSON schema before saving
  try {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(programSchema as any);
    const valid = validate(program);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid program payload', details: validate.errors }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Schema validation failed', details: e?.message ?? String(e) }, { status: 500 });
  }
  const supabase = getServiceSupabaseClient();
  await supabase.from('programs').upsert({ id: program.program_id, user_id: body.userId ?? null, name: program.name, data: program, paid: program.paid ?? false });
  return NextResponse.json(program, { status: 201 });
}


