-- Payment history table
-- Run in Supabase SQL editor manually

create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  program_id uuid,
  reason text check (reason in ('unlock_full_program','regenerate_program')),
  amount_cents int not null,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

alter table public.payment_history enable row level security;
drop policy if exists payment_history_read on public.payment_history;
create policy payment_history_read on public.payment_history
  for select
  using (auth.uid() = user_id);


