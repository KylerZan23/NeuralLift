# NeuralLift

Science-based lifting tailored to you. Generate and unlock a 12-week hypertrophy program.

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (Auth + Postgres), Stripe (Checkout + Webhooks)
- OpenAI (LLM-first generation with deterministic fallback), Framer Motion
- Jest + Testing Library, Storybook

## Env
Create `.env.local` from `env.example` and set values.

Key vars:
- NEXT_PUBLIC_BASE_URL
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- STRIPE_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE, STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_PROGRAM_UNLOCK (Stripe Price ID for program unlock)
- OPENAI_API_KEY (required for personalized LLM generation; if omitted we fall back to deterministic rules)

## Scripts
- yarn dev
- yarn build
- yarn start
- yarn test
- yarn storybook

## API
- POST `/api/generate-program` — body: `{ programId?, useGPT? (default true), userId?, input }` -> creates 12-week program and upserts to DB. When `OPENAI_API_KEY` is present and `useGPT=true`, uses LLM-first generation; otherwise deterministic fallback.
- GET `/api/program/:id` — fetch program by id.
- POST `/api/pr/update` — upsert PRs for the authenticated user `{ bench?, squat?, deadlift? }`.
- POST `/api/stripe-session` — returns Checkout URL. Supports `reason: 'unlock_full_program' | 'regenerate_program'` and `userId` metadata.
- Body is validated; `programId` required. Session line items use Stripe Price ID from env.
- POST `/api/stripe-webhook` — marks `programs.paid = true` via service role.

## Auth
- Google sign-in with Supabase: click header button. Ensure redirect URLs configured in Supabase Auth.

## Onboarding → Program
- Answers persist in localStorage per step.
- Final step shows a loading screen and posts to `/api/generate-program`; on success it redirects to `/program/{id}`.

### Accessory Weight Prescription
- Program page displays suggested working weights for mapped accessories based on user's Big-3 PRs.
 - Formula: Accessory 1RM = Big-3 1RM × ratio (experience-adjusted), Working = Accessory 1RM × 0.82, rounded to nearest 5 lb. Beginners use midpoint of ratio; Intermediate/Advanced use upper bound.
- Logic lives in `lib/weight-prescription.ts`. UI integration in `components/ProgramWeekView.tsx`.

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
- Write endpoints derive user from server auth context; do not trust client-provided `user_id`.
- LLM-first generation: set `OPENAI_API_KEY` to enable; server validates model output against `types/program.schema.json` and attempts a single repair; falls back to deterministic generator on failure.
- Program schema is validated with AJV against `types/program.schema.json` before saving.

## Testing
- `yarn test` — unit tests for onboarding, gating, a11y.
- Consider adding Playwright E2E for full flow.
- E2E examples in `tests-e2e/` include onboarding loader and dashboard PR save flow.

## Storybook
- `yarn storybook` — components documented with CSF stories.
