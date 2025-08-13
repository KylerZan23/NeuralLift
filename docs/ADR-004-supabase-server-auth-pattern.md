# ADR-004 — Supabase server-side auth for write endpoints

## Status
Accepted

## Context
`/api/pr/update` previously accepted `user_id` from the client, which allowed spoofing. We also had mixed usage of anon and service clients for writes.

## Decision
Adopt a consistent pattern: write endpoints derive the authenticated user on the server (service client session context) and never trust client-provided user ids. Bodies are validated with Zod.

## Consequences
- Improves security by preventing impersonation.
- Requires tests/mocks for server-side auth.
- Minor refactors in handlers.


