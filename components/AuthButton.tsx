'use client';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { ensureAuthOrStartOAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

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
    <Button variant="ghost" onClick={signOut}>Sign out ({email})</Button>
  ) : (
    <Button variant="secondary" onClick={signInWithGoogle}>Sign in with Google</Button>
  );
}

