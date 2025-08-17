# ADR-015: OAuth UX Improvement - Replace Popup with Same-Tab Redirect

## Status
Accepted

## Context
Users were experiencing poor UX with Google OAuth authentication due to a popup-based flow that caused workflow disruption:

1. User clicks "Sign up with Google"
2. New popup window opens for Google OAuth
3. User completes OAuth and gets redirected to onboarding in popup
4. User completes entire onboarding flow in popup window
5. When user clicks "Generate my program", popup closes
6. User returns to original page and is forced to repeat onboarding

This popup-based approach was causing significant user frustration and abandonment.

## Decision
Replace the complex popup-based OAuth flow with a simple same-tab redirect approach.

### Changes Made

**Simplified Authentication Flow**:
- Removed all popup window creation and management code
- Eliminated complex event listeners for popup state
- Removed timeout and interval handling for popup monitoring
- Simplified to direct OAuth redirect in same tab

**Code Changes**:
- `lib/utils/auth.ts`: Replaced 80+ lines of popup logic with 12 lines of redirect logic
- `app/(marketing)/page.tsx`: Updated comments to reflect new flow
- Maintained backward compatibility with existing function signatures

### New Flow
1. User clicks "Sign up with Google"
2. Same tab redirects to Google OAuth
3. Google redirects back to `/api/auth/callback?next=/onboarding/1`
4. User completes onboarding in same tab
5. Program generation works seamlessly

## Consequences

### Positive
- **Improved UX**: No more popup windows or workflow interruption
- **Simplified Code**: Removed 80+ lines of complex popup management
- **Better Mobile Support**: Same-tab flow works better on mobile devices
- **Reduced Bugs**: Eliminated popup blocker issues and cross-window state management
- **Cleaner State Management**: No more complex event handling between windows

### Negative
- **Page Navigation**: Users leave the landing page during OAuth (minor)
- **Lost Landing Context**: Users don't return to exact landing page state

### Neutral
- **Session Handling**: No changes to underlying authentication mechanisms
- **Security**: Same level of OAuth security maintained
- **API Compatibility**: All existing API endpoints work unchanged

## Alternatives Considered

1. **Fix Popup Issues**: Attempt to resolve popup state synchronization
   - Rejected: Complex, brittle, poor mobile experience

2. **Iframe OAuth**: Use iframe for authentication
   - Rejected: Security concerns, blocked by many providers

3. **Modal OAuth**: Use modal instead of popup
   - Rejected: Still requires complex state management

## Implementation Details

**Before** (`lib/utils/auth.ts`):
```typescript
// 80+ lines of popup management, timeouts, intervals, event listeners
let popup: Window | null = null;
// Complex popup positioning, state monitoring, cleanup...
```

**After** (`lib/utils/auth.ts`):
```typescript
// Simple redirect-based flow
if (base) {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { 
      redirectTo: `${base}/api/auth/callback?next=${encodeURIComponent(redirectTo)}` 
    }
  });
} else {
  await supabase.auth.signInWithOAuth({
    provider: 'google'
  });
}
```

## Validation

- ✅ Build passes TypeScript strict checks
- ✅ No breaking changes to existing components
- ✅ OAuth callback handling unchanged
- ✅ Session management remains intact
- ✅ Significant code complexity reduction

## Related Documents
- [ADR-012: Supabase SSR Restructure](./ADR-012-supabase-ssr-restructure.md)
- [ADR-011: Supabase SSR Authentication](./ADR-011-supabase-ssr-authentication.md)

## Date
2025-01-13
