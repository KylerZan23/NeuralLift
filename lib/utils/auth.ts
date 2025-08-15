import { getSupabaseClient } from '@/lib/integrations/supabase';

export async function ensureAuthOrStartOAuth(redirectTo: string): Promise<'proceeded' | 'started_oauth'> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) return 'proceeded';
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
  // Prefer popup flow so we don't navigate away from the landing page
  try {
    let popup: Window | null = null;
    if (typeof window !== 'undefined') {
      const width = 600;
      const height = 700;
      const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
      const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
      // Open a blank popup synchronously to avoid popup blockers
      popup = window.open(
        'about:blank',
        'neuralift_google_oauth',
        `toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1,width=${width},height=${height},top=${top},left=${left}`
      );
    }
    const { data: oauthData } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: base ? { redirectTo: `${base}${redirectTo}`, skipBrowserRedirect: true } : { skipBrowserRedirect: true }
    });
    const url = oauthData?.url;
    if (typeof window !== 'undefined' && url) {
      if (popup && !popup.closed) {
        try { popup.location.href = url; } catch { popup = window.open(url, 'neuralift_google_oauth'); }
      } else {
        popup = window.open(url, 'neuralift_google_oauth');
      }

      return await new Promise<'proceeded' | 'started_oauth'>(resolve => {
        let settled = false;
        const timeout = window.setTimeout(() => {
          if (!settled) {
            settled = true;
            resolve('started_oauth');
          }
        }, 120000);

        // Close watcher
        const closeInterval = window.setInterval(async () => {
          if (!popup || popup.closed) {
            // Check if session exists now that popup is closed
            const { data: after } = await supabase.auth.getUser();
            if (!settled && after.user) {
              settled = true;
              window.clearTimeout(timeout);
              window.clearInterval(closeInterval);
              resolve('proceeded');
            } else if (!settled && (!popup || popup?.closed)) {
              settled = true;
              window.clearTimeout(timeout);
              window.clearInterval(closeInterval);
              resolve('started_oauth');
            }
          }
        }, 500);

        const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
          if (event === 'SIGNED_IN' && !settled) {
            settled = true;
            try { popup?.close(); } catch {}
            window.clearTimeout(timeout);
            window.clearInterval(closeInterval);
            resolve('proceeded');
          }
        });

        // Safety: clean up when promise settles
        const finalize = (value: 'proceeded' | 'started_oauth') => {
          sub?.data?.subscription?.unsubscribe?.();
          try { popup?.close(); } catch {}
          return value;
        };

        // Wrap resolve to ensure cleanup
        const originalResolve = resolve;
        // @ts-expect-error - Overriding resolve to ensure cleanup
        resolve = (v: 'proceeded' | 'started_oauth') => originalResolve(finalize(v));
      });
    }
  } catch {}

  // Fallback to full-page redirect if popup could not be opened
  await supabase.auth.signInWithOAuth({ provider: 'google', options: base ? { redirectTo: `${base}${redirectTo}` } : undefined });
  return 'started_oauth';
}


