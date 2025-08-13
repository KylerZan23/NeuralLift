import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getServiceSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { programId, reason } = await req.json();
  if (!programId) return NextResponse.json({ error: 'programId required' }, { status: 400 });
  // Derive userId from the program owner; do not trust client input
  const supabase = getServiceSupabaseClient();
  const { data: program, error } = await supabase.from('programs').select('id,user_id').eq('id', programId).single();
  if (error || !program) return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  const url = await createCheckoutSession({ programId, reason: reason ?? 'unlock_full_program', userId: program.user_id ?? undefined });
  return NextResponse.json({ url }, { status: 200 });
}


