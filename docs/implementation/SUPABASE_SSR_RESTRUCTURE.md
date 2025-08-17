# Supabase SSR Authentication Restructure Implementation Plan

## Problem Statement

Training program generation is failing with 401 Unauthorized errors due to improper session synchronization between client and server. The current partial SSR implementation lacks proper middleware and structured client management.

## Current Issues

1. **Session Persistence**: Client authentication doesn't properly set cookies for server-side verification
2. **Missing Middleware**: No middleware to refresh/update sessions on each request  
3. **Inconsistent Patterns**: Mixed client creation patterns across the codebase
4. **Production Failures**: Works locally but fails in production environment

## Solution: Structured SSR Implementation

### Implementation Steps

#### 1. Create Structured Supabase Clients
- **`/lib/supabase/client.ts`**: Browser client with cookie support
- **`/lib/supabase/server.ts`**: Server client with cookie handlers  
- **`/lib/supabase/middleware.ts`**: Middleware session management

#### 2. Implement Middleware
- **`/middleware.ts`**: Session update middleware for all requests
- Ensures sessions are refreshed on each page/API request
- Maintains proper cookie synchronization

#### 3. Refactor API Routes
- Update `/api/generate-program/route.ts` to use structured server client
- Maintain existing business logic and security patterns
- Simplify authentication code using new patterns

#### 4. Update Client Components  
- Migrate existing client components to use new structured client
- Ensure backwards compatibility with existing auth flows
- Test OAuth popup flow integration

#### 5. Validation & Testing
- Verify session cookies are properly set/maintained
- Test full authentication flow from client to server
- Validate production deployment compatibility

## Expected Benefits

✅ **Reliable Authentication**: Consistent session management across all environments  
✅ **Production Ready**: Proper cookie handling for production deployments  
✅ **Maintainable Code**: Clear separation of client/server/middleware concerns  
✅ **Type Safety**: Full TypeScript support with proper async patterns  
✅ **Security Enhanced**: Robust session verification on all protected routes

## Files to be Modified

### New Files
- `/lib/supabase/client.ts`
- `/lib/supabase/server.ts` 
- `/lib/supabase/middleware.ts`
- `/middleware.ts`

### Updated Files
- `/app/api/generate-program/route.ts`
- `/lib/integrations/supabase.ts` (deprecated/refactored)
- `/components/AuthButton.tsx`
- `/lib/utils/auth.ts`

### Documentation Updates
- `README.md` - Authentication section
- New ADR documenting the restructure
- Update existing SSR ADR with completion status

## Risk Mitigation

- **Backwards Compatibility**: Maintain existing function signatures where possible
- **Incremental Migration**: Update one component at a time with testing
- **Rollback Plan**: Keep existing files as backup until verification complete
- **Testing Strategy**: Validate each step before proceeding to next

## Success Criteria

1. Users can successfully generate programs in production
2. No 401 Unauthorized errors during authenticated flows
3. Session persistence works across browser refresh/navigation
4. OAuth popup flow continues to function properly
5. All existing tests pass with new implementation
