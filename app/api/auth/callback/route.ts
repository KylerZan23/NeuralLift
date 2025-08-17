import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('🔄 [auth-callback] Processing OAuth callback');
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('📋 [auth-callback] Callback params:', {
    hasCode: !!code,
    next,
    origin,
  });

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    console.log('🔄 [auth-callback] Exchanging code for session');
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('🔐 [auth-callback] Code exchange result:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message,
      userId: data.user?.id,
      userEmail: data.user?.email,
    });

    if (!error && data.session) {
      console.log('✅ [auth-callback] OAuth success - redirecting to:', next);
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('❌ [auth-callback] Code exchange failed:', error?.message);
    }
  } else {
    console.error('❌ [auth-callback] No authorization code received');
  }

  // Return the user to an error page with instructions
  console.log('🔄 [auth-callback] Redirecting to error/retry');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
