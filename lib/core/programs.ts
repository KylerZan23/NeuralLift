import { SupabaseClient } from '@supabase/supabase-js';

export async function fetchLatestProgramIdForUser(supabase: SupabaseClient, userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data?.id ?? null;
}


