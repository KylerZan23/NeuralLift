import { getSupabaseClient } from '@/lib/supabase';

export async function ensureAuthOrStartOAuth(redirectTo: string): Promise<'proceeded' | 'started_oauth'> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) return 'proceeded';
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
  await supabase.auth.signInWithOAuth({ provider: 'google', options: base ? { redirectTo: `${base}${redirectTo}` } : undefined });
  return 'started_oauth';
}


