# NeuralLift

Science-based lifting tailored to you. Generate and unlock a 12-week hypertrophy program.

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (Auth + Postgres), Stripe (Checkout + Webhooks)
- OpenAI (LLM-first generation with deterministic fallback), Framer Motion
- Jest + Testing Library, Storybook

## Environment Setup & Security

**⚠️ CRITICAL: Never commit environment files to version control!**

1. Copy `env.example` to `.env.local`
2. Fill in your actual API keys and secrets
3. Ensure `.env.local` is in your `.gitignore` (already configured)

### Required Environment Variables

**Supabase Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only, keep secret!)

**Application Configuration:**
- `NEXT_PUBLIC_BASE_URL` - Your app's base URL (e.g., http://localhost:3000)

**Stripe Configuration:**
- `STRIPE_SECRET` - Stripe secret key (server-only, keep secret!)
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret
- `STRIPE_PRICE_PROGRAM_UNLOCK` - Stripe Price ID for program unlock

**AI Configuration:**
- `OPENAI_API_KEY` - OpenAI API key (server-only, keep secret!)

**Optional - Redis (for rate limiting):**
- `UPSTASH_REDIS_REST_URL` - Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis REST API token

### Security Best Practices
- ✅ Use `.env.local` for local development
- ✅ Never commit `.env.local` to Git
- ✅ Use `NEXT_PUBLIC_` prefix only for client-safe variables
- ✅ Keep service keys and secrets server-side only
- ✅ Rotate API keys regularly
- ✅ Use environment-specific files (`.env.production`, `.env.staging`) for deployments

## Scripts
- yarn dev
- yarn build
- yarn start
- yarn test
- yarn storybook

## API
- POST `/api/generate-program` — body: `{ programId?, useGPT? (default true), input }` -> creates 12-week program and upserts to DB for the authenticated user (derived server-side). When `OPENAI_API_KEY` is present and `useGPT=true`, uses LLM-first generation; otherwise deterministic fallback.
- GET `/api/program/:id` — fetch program by id. Requires auth; enforces ownership on server.
- POST `/api/pr/update` — upsert PRs for the authenticated user `{ bench?, squat?, deadlift? }`.
- POST `/api/stripe-session` — returns Checkout URL. Supports `reason: 'unlock_full_program' | 'regenerate_program'`. Server derives user and verifies program ownership; `userId` is no longer accepted from client.

### Rate limiting
- `POST /api/generate-program` applies a 5 req/min per IP rate limit. If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, it uses Upstash Redis REST; otherwise an in-memory fallback is used.

### Validation formats
- AJV is configured with `ajv-formats` to support `date-time` and other common formats. This silences prior console warnings.

### Database migrations
- New migration `0007_programs_user_not_null.sql` enforces `programs.user_id` as NOT NULL (ownership required). Run in Supabase SQL editor.
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

### TypeScript & Build Configuration
- **Strict Type Safety**: Project uses `exactOptionalPropertyTypes: true` in TypeScript config for enhanced type safety
- **Build Compatibility**: All optional properties must be handled without explicit `undefined` assignments
- **Fixed Issues**: Resolved Vercel build errors related to:
  - Optional `notes` property in Day objects (`program-generator.ts`)
  - Optional `user_id` assignments in Program objects
  - Supabase auth subscription cleanup patterns (`auth.ts`)
  - OAuth options parameter handling
- See `docs/implementation/TYPESCRIPT_BUILD_ERROR_FIX.md` for detailed fix documentation

### Authentication & Session Management
- **Structured SSR Implementation**: Complete Supabase SSR pattern with middleware-based session management
- **Production Ready**: Reliable authentication across all environments with proper cookie handling
- **Middleware Integration**: Automatic session refresh and synchronization on every request
- **Simplified API Security**: Clean server-side authentication with structured client patterns
- **Session Persistence**: Robust session management across browser navigation and refresh
- **OAuth Integration**: Same-tab Google authentication with proper session handling
- **Fixed Issues**: Resolved production authentication failures including:
  - 401 Unauthorized errors during program generation
  - Session cookie synchronization problems
  - Client/server authentication state mismatches
- See `docs/ADR-012-supabase-ssr-restructure.md` for complete implementation details

## Testing
- `yarn test` — unit tests for onboarding, gating, a11y.
- Consider adding Playwright E2E for full flow.
- E2E examples in `tests-e2e/` include onboarding loader and dashboard PR save flow.

## Storybook
- `yarn storybook` — components documented with CSF stories.

---
---
---