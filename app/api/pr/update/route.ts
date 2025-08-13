import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, bench, squat, deadlift } = body ?? {};
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  try {
    const supabase = getServiceSupabaseClient();
    const { error } = await supabase.from('prs').upsert({ user_id, bench, squat, deadlift, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Also append to history for graphing
    await supabase.from('pr_history').insert({ user_id, bench, squat, deadlift });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

