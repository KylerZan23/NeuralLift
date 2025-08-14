# ADR-004 — Supabase server-side auth for write endpoints

## Status
Accepted

## Context
`/api/pr/update` previously accepted `user_id` from the client, which allowed spoofing. We also had mixed usage of anon and service clients for writes.

## Decision
Adopt a consistent pattern: write endpoints derive the authenticated user on the server (session via `@supabase/ssr` cookies) and never trust client-provided user ids. Bodies are validated with Zod. Read endpoints that return sensitive user data also enforce authentication and ownership server-side.

## Consequences
- Improves security by preventing impersonation.
- Requires tests/mocks for server-side auth.
- Minor refactors in handlers.
- `GET /api/program/[id]` now requires auth and checks ownership.


