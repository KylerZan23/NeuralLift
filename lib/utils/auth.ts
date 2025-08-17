import { getSupabaseClient } from '@/lib/integrations/supabase';

export async function ensureAuthOrStartOAuth(redirectTo: string): Promise<'proceeded' | 'started_oauth'> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) return 'proceeded';
  
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
  
  // Use same-tab redirect for better UX - no popup windows
  if (base) {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${base}/api/auth/callback?next=${encodeURIComponent(redirectTo)}` 
      }
    });
  } else {
    await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
  }
  
  return 'started_oauth';
}


