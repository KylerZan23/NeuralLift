-- Secure RLS for prs table - restrict access to user's own data
-- This migration replaces the permissive `using (true)` policy with ownership-based access

-- Drop the existing permissive read policy
drop policy if exists prs_read on public.prs;

-- Create secure read policy that restricts users to their own PR data
create policy prs_read_secure on public.prs
  for select
  using (auth.uid() = user_id);

-- Update write policies to also use ownership-based checks
drop policy if exists prs_write on public.prs;
drop policy if exists prs_update on public.prs;

-- Create secure write policy for insert
create policy prs_insert_secure on public.prs
  for insert
  with check (auth.uid() = user_id);

-- Create secure update policy 
create policy prs_update_secure on public.prs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ensure RLS is enabled (should already be enabled from initial migration)
alter table public.prs enable row level security;
