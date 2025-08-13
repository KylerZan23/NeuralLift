# ADR-002 — Payment history table

## Status
Accepted

## Context
We need an auditable record of purchases (unlock vs regenerate) and amounts paid per program/user.

## Decision
Create `payment_history` table with fields: `id`, `user_id`, `program_id`, `reason`, `amount_cents`, `stripe_session_id`, `created_at`. Log new rows on `checkout.session.completed` webhook.

## Consequences
- Analytics and support can trace purchases.
- RLS ensures users only read their own history.

