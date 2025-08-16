import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/integrations/stripe';
import { getServiceSupabaseClient } from '@/lib/integrations/supabase-server';
import { z } from 'zod';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const BodySchema = z.object({
  programId: z.string().min(1),
  reason: z.enum(['unlock_full_program', 'regenerate_program'])
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { programId, reason } = parsed.data;

  // Ensure the requester is authenticated and owns the program
  const cookieStore = cookies();
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
  const user = auth?.user ?? null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Derive userId from the program owner; do not trust client input
  const supabase = getServiceSupabaseClient();
  const { data: program, error } = await supabase.from('programs').select('id,user_id').eq('id', programId).single();
  if (error || !program) return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  if (program.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = await createCheckoutSession({ programId, reason, userId: program.user_id ?? undefined });
  return NextResponse.json({ url }, { status: 200 });
}


