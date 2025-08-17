import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  cachedClient = createClient();
  return cachedClient;
}

export async function fetchProgram(programId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('programs').select('*').eq('id', programId).single();
  if (error) throw error;
  return data;
}

export async function markProgramPaid(programId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('programs').update({ paid: true }).eq('id', programId).select().single();
  if (error) throw error;
  return data;
}


