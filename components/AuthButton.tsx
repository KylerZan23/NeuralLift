'use client';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { ensureAuthOrStartOAuth } from '@/lib/auth';

export default function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signInWithGoogle = async () => {
    await ensureAuthOrStartOAuth('/dashboard');
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setEmail(null);
  };

  return email ? (
    <button onClick={signOut} className="rounded-xl bg-white/10 px-4 py-2">Sign out ({email})</button>
  ) : (
    <button onClick={signInWithGoogle} className="rounded-xl bg-white text-gray-900 px-4 py-2 font-semibold">Sign in with Google</button>
  );
}

