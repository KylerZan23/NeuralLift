import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  cachedClient = createBrowserClient(url, anon);
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


