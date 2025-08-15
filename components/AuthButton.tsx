'use client';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/integrations/supabase';
import { ensureAuthOrStartOAuth } from '@/lib/auth';
import { Button } from '@/lib/ui/button';

export default function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        try {
          localStorage.removeItem('onboarding_state');
        } catch {}
        setEmail(session?.user?.email ?? null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await ensureAuthOrStartOAuth('/dashboard');
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    try {
      localStorage.removeItem('onboarding_state');
    } catch {}
    setEmail(null);
  };

  return email ? (
    <Button variant="ghost" className="text-white" onClick={signOut}>Sign out ({email})</Button>
  ) : (
    <Button variant="secondary" onClick={signInWithGoogle}>Sign in with Google</Button>
  );
}

