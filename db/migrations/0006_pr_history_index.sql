-- Index for PR history queries by user and time
create index if not exists idx_pr_history_user_time on public.pr_history(user_id, created_at);

