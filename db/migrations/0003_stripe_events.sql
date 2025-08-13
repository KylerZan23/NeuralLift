-- Stripe webhook idempotency support
-- Run in Supabase SQL editor

create table if not exists public.stripe_events (
  id text primary key,
  type text,
  created_at timestamptz not null default now()
);

-- RLS optional; service role bypasses. Enable if you plan to read from client.
alter table public.stripe_events enable row level security;
create policy if not exists stripe_events_read on public.stripe_events for select using (true);
