# NeuralLift

Science-based lifting tailored to you. Generate and unlock a 12-week hypertrophy program.

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (Auth + Postgres), Stripe (Checkout + Webhooks)
- OpenAI (optional GPT refinement), Framer Motion
- Jest + Testing Library, Storybook

## Env
Create `.env.local` from `env.example` and set values.

Key vars:
- NEXT_PUBLIC_BASE_URL
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- STRIPE_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE, STRIPE_WEBHOOK_SECRET
- OPENAI_API_KEY (optional)

## Scripts
- yarn dev
- yarn build
- yarn start
- yarn test
- yarn storybook

## API
- POST `/api/generate-program` — body: `{ programId?, useGPT?, userId?, input }` -> creates 12-week program and upserts to DB.
- GET `/api/program/:id` — fetch program by id.
- POST `/api/pr/update` — upsert PRs `{ user_id, bench, squat, deadlift }`.
- POST `/api/stripe-session` — returns Checkout URL. Supports `reason: 'unlock_full_program' | 'regenerate_program'` and `userId` metadata.
- POST `/api/stripe-webhook` — marks `programs.paid = true` via service role.

## Auth
- Google sign-in with Supabase: click header button. Ensure redirect URLs configured in Supabase Auth.

## Onboarding → Program
- Answers persist in localStorage per step.
- Final step shows a loading screen and posts to `/api/generate-program`; on success it redirects to `/program/{id}`.

## Gating
- Week 1 free; weeks 2–12 gated until Stripe payment succeeds.
- Program page refetches after `?checkout=success` and shows a success toast.
- Regenerate flow: when PRs improve, you may open checkout with `reason='regenerate_program'` to purchase a fresh program.

## Dashboard
- PRs can be saved to Supabase via `/api/pr/update`; values are loaded on mount when signed in.

## Database
Run migrations in Supabase SQL editor (manual):
- `db/migrations/0001_schema.sql` — creates `programs`, `prs`, enables RLS, base policies.
- `db/migrations/0002_programs_rls.sql` — tighten `programs` read policy to per-user.
- `db/migrations/0003_stripe_events.sql` — stripe webhook idempotency table.
- `db/migrations/0004_payment_history.sql` — adds `payment_history` table and RLS policy.

## Dev notes
- Server routes use service role client (`lib/supabase-server.ts`) to bypass RLS for writes.
- Optional GPT refinement: set `OPENAI_API_KEY` to refine program JSON.
- Program schema is validated with AJV against `types/program.schema.json` before saving.

## Testing
- `yarn test` — unit tests for onboarding, gating, a11y.
- Consider adding Playwright E2E for full flow.
- E2E examples in `tests-e2e/` include onboarding loader and dashboard PR save flow.

## Storybook
- `yarn storybook` — components documented with CSF stories.
