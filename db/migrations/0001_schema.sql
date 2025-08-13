-- NeuralLift initial schema
create extension if not exists pgcrypto;

-- programs table
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  data jsonb not null,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

-- prs table
create table if not exists public.prs (
  user_id uuid primary key,
  bench int,
  squat int,
  deadlift int,
  updated_at timestamptz not null default now()
);

-- Enable RLS (service role bypasses automatically)
alter table public.programs enable row level security;
alter table public.prs enable row level security;

-- Read policies for authenticated users (broad read for now)
create policy if not exists programs_read on public.programs for select using (true);
create policy if not exists prs_read on public.prs for select using (true);

-- Write policies (restrict to authenticated; service role bypasses)
create policy if not exists prs_write on public.prs for insert with check (auth.role() = 'authenticated');
create policy if not exists prs_update on public.prs for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Indexes
create index if not exists idx_programs_user on public.programs(user_id);
