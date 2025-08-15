import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/integrations/supabase-server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Program } from '@/types/program';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Derive authenticated user to enforce RLS-like ownership on server fetch as well (cookie or bearer)
    const cookieStore = cookies();
    let user: User | null = null;
    try {
      const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set(name, value, options);
            },
            remove(name: string, options: CookieOptions) {
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
        const bearer = _req.headers.get('authorization') ?? _req.headers.get('Authorization');
        const token = bearer?.toLowerCase().startsWith('bearer ')
          ? bearer.slice(7)
          : undefined;
        if (token) {
          const direct = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
          );
          const { data: auth } = await direct.auth.getUser();
          user = auth?.user ?? null;
        }
      } catch {}
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase.from('programs').select('data,user_id,paid').eq('id', params.id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404, headers: { 'Cache-Control': 'private, max-age=15' } });
    
    const programData = data as { data: Program, user_id: string, paid: boolean };
    if (programData?.user_id && programData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return new NextResponse(JSON.stringify(programData?.data ?? null), {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=15', 'Content-Type': 'application/json' }
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

