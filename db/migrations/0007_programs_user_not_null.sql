-- Enforce ownership on programs: user_id NOT NULL
-- Run in Supabase SQL editor manually

alter table public.programs
  alter column user_id set not null;


