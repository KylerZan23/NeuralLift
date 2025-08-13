-- Tighten programs RLS to per-user reads
-- Run in Supabase SQL editor

-- Ensure RLS is enabled
alter table public.programs enable row level security;

-- Replace broad read policy with per-user read policy
drop policy if exists programs_read on public.programs;
create policy programs_read on public.programs
  for select
  using (user_id is null or user_id = auth.uid());

-- Note: writes are handled by service role in server API routes and bypass RLS.
