# ADR-008: PRS Table Row Level Security Hardening

**Date:** 2024-12-19  
**Status:** Accepted  
**Decision Makers:** Architecture Team  

## Context

The initial database schema contained a significant security vulnerability in the `prs` table Row Level Security (RLS) policy. The read policy used `using (true)`, which allowed any authenticated user to access any other user's Personal Record (PR) data.

```sql
-- Vulnerable policy from 0001_schema.sql
create policy if not exists prs_read on public.prs for select using (true);
```

This violated the principle of data isolation and could expose sensitive fitness data between users.

## Problem

- **Data Privacy Violation**: Users could potentially access other users' PR data
- **Regulatory Risk**: Potential violations of data protection regulations (GDPR, CCPA)
- **Trust Risk**: Users expect their fitness data to remain private
- **Inconsistent Security**: The `pr_history` table already had proper ownership-based RLS

## Decision

We will implement strict ownership-based RLS policies for the `prs` table that ensure users can only access their own data.

### Migration: `0008_prs_secure_rls.sql`

1. **Drop Permissive Policies**: Remove the `using (true)` read policy
2. **Implement Ownership-Based Access**: Create policies that restrict access based on `auth.uid() = user_id`
3. **Enhance Write Policies**: Ensure insert and update operations also enforce ownership

### New RLS Policies

```sql
-- Secure read policy
create policy prs_read_secure on public.prs
  for select
  using (auth.uid() = user_id);

-- Secure insert policy  
create policy prs_insert_secure on public.prs
  for insert
  with check (auth.uid() = user_id);

-- Secure update policy
create policy prs_update_secure on public.prs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Alternatives Considered

1. **Application-Level Filtering**: Continue with permissive RLS and filter in application code
   - **Rejected**: Less secure, prone to bugs, doesn't provide defense in depth

2. **Service Role Only Access**: Remove client-side access entirely, use API endpoints only
   - **Rejected**: Would require significant frontend refactoring and reduce performance

3. **Partial Hardening**: Only secure read access, leave write access as-is
   - **Rejected**: Incomplete security improvement

## Consequences

### Positive
- ✅ **Enhanced Security**: Users cannot access other users' PR data
- ✅ **Defense in Depth**: Database-level enforcement independent of application logic  
- ✅ **Consistent Security Model**: Aligns with `pr_history` table security pattern
- ✅ **Regulatory Compliance**: Better alignment with data protection requirements
- ✅ **Zero Breaking Changes**: Existing code already filters by `user_id`

### Neutral
- 🔄 **Migration Required**: Need to apply database migration in all environments
- 🔄 **Testing Required**: Need to verify functionality and security

### Negative
- ❌ **No Known Downsides**: The existing frontend and API code already filter by user_id

## Implementation Details

### Code Analysis
The existing codebase already follows secure patterns:

- **Frontend Components**: Use `supabase.from('prs').select('*').eq('user_id', uid)`
- **API Endpoints**: Use service role client (bypasses RLS) with proper authentication
- **Consistent Pattern**: Matches security model used in `pr_history` table

### Testing Strategy
1. **Functional Testing**: Verify authenticated users can access their own data
2. **Security Testing**: Confirm users cannot access other users' data  
3. **Integration Testing**: Ensure API endpoints continue to work correctly

### Deployment Plan
1. Apply migration in development environment
2. Run comprehensive tests
3. Apply to staging environment  
4. Verify production readiness
5. Apply to production during maintenance window

## Monitoring

- Monitor for any application errors after deployment
- Verify that PR-related functionality continues to work correctly
- Monitor database performance (RLS policies can impact query performance)

## Related ADRs

- **ADR-004**: Supabase Server Auth Pattern - Establishes service role usage patterns
- **Future ADR**: Consider extending this security model to other tables if needed

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
