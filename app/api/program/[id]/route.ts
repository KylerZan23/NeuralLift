import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase.from('programs').select('data').eq('id', params.id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404, headers: { 'Cache-Control': 'private, max-age=15' } });
    return new NextResponse(JSON.stringify(data?.data ?? null), {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=15', 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

