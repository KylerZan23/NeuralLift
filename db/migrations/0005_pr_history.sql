-- PR history table to persist longitudinal PRs for graphs
-- Run in Supabase SQL editor manually

create table if not exists public.pr_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  bench int,
  squat int,
  deadlift int,
  created_at timestamptz not null default now()
);

alter table public.pr_history enable row level security;
drop policy if exists pr_history_read on public.pr_history;
create policy pr_history_read on public.pr_history
  for select
  using (auth.uid() = user_id);

drop policy if exists pr_history_write on public.pr_history;
create policy pr_history_write on public.pr_history
  for insert
  with check (auth.uid() = user_id);


