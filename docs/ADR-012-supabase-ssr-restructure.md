# ADR-012: Supabase SSR Authentication Restructure

**Date**: 2024-01-15  
**Status**: Implemented  
**Context**: Critical production authentication fix

## Problem

Training program generation was failing with 401 Unauthorized errors due to improper session synchronization between client and server. The existing partial SSR implementation lacked proper middleware and structured client management patterns.

### Root Cause Analysis

1. **Incomplete SSR Implementation**: While `@supabase/ssr` was partially implemented, it lacked the structured approach needed for reliable session management
2. **Missing Middleware**: No middleware to refresh and update sessions on each request 
3. **Session Cookie Issues**: Authentication state wasn't properly synchronized between browser and server
4. **Production Failures**: Worked locally but failed in production environment

## Decision

Implement a complete, structured Supabase SSR authentication pattern with proper separation of concerns and middleware-based session management.

### Implementation Pattern

**Structured Client Architecture:**
```typescript
// Client-side browser client with cookie support
lib/supabase/client.ts
// Server-side client with cookie handlers  
lib/supabase/server.ts
// Middleware for session management
lib/supabase/middleware.ts
// Application middleware
middleware.ts
```

### Technical Implementation

#### 1. Structured Supabase Clients

**Client (`lib/supabase/client.ts`):**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server (`lib/supabase/server.ts`):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(url, anon, { cookies: cookieHandlers })
}
```

#### 2. Middleware Implementation

**Session Management (`lib/supabase/middleware.ts`):**
- Handles session refresh on each request
- Manages cookie synchronization between request/response
- Ensures proper session state persistence

**Application Middleware (`middleware.ts`):**
- Applies session updates to all routes
- Excludes static assets and optimization files
- Maintains session freshness across navigation

#### 3. API Route Simplification

**Before (Complex Authentication):**
```typescript
// 30+ lines of complex cookie handling and fallback logic
const authClient = createServerClient(url, anon, { cookies: { ... } });
// Bearer token fallback logic
// Multiple try-catch blocks
```

**After (Simplified):**
```typescript
const cookieStore = cookies();
const supabase = createClient(cookieStore);
const { data: { session } } = await supabase.auth.getSession();
if (!session) return new NextResponse('Unauthorized', { status: 401 });
```

## Consequences

### Positive
✅ **Production Ready**: Users can now successfully generate programs in production  
✅ **Session Persistence**: Reliable session management across all environments  
✅ **Maintainable Code**: Clear separation of client/server/middleware concerns  
✅ **Type Safety**: Full TypeScript support with proper async patterns  
✅ **Security Enhanced**: Consistent session verification on all protected routes  
✅ **Performance**: Middleware efficiently handles session updates  

### Technical Details
- **Build Size**: Middleware adds 62.6 kB to build (acceptable for session management)
- **Backwards Compatibility**: Maintained existing component interfaces
- **Edge Runtime**: Some warnings expected with Supabase realtime features (non-blocking)

### Files Modified

**New Files:**
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client  
- `lib/supabase/middleware.ts` - Session management
- `middleware.ts` - Application middleware
- `docs/implementation/SUPABASE_SSR_RESTRUCTURE.md` - Implementation plan

**Updated Files:**
- `app/api/generate-program/route.ts` - Simplified authentication
- `lib/integrations/supabase.ts` - Updated to use structured client
- Various test files - Fixed import paths

### Migration Notes

- Existing components continue to work without changes
- `getSupabaseClient()` function maintained for backwards compatibility
- OAuth popup flow preserved and functional
- All existing business logic and security patterns maintained

## Success Criteria

✅ Users can successfully generate programs in production  
✅ No 401 Unauthorized errors during authenticated flows  
✅ Session persistence works across browser refresh/navigation  
✅ OAuth popup flow continues to function properly  
✅ Build completes successfully with TypeScript validation  
✅ Middleware properly integrated (visible in build output)

## References

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- Previous: `ADR-011-supabase-ssr-authentication.md` (superseded)
