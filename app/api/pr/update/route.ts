import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const BodySchema = z.object({
  bench: z.number().nullable().optional(),
  squat: z.number().nullable().optional(),
  deadlift: z.number().nullable().optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  try {
    // Derive authenticated user on the server from cookies (not from client input)
    const cookieStore = cookies();
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
    const user = auth?.user ?? null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const service = getServiceSupabaseClient();
    const { bench, squat, deadlift } = parsed.data;
    const now = new Date().toISOString();
    const { error } = await service.from('prs').upsert({ user_id: user.id, bench, squat, deadlift, updated_at: now });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await service.from('pr_history').insert({ user_id: user.id, bench, squat, deadlift, created_at: now });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unexpected error' }, { status: 500 });
  }
}

