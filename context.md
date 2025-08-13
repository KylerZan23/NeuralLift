# PRD / Context — NeuralLift (for Cursor AI)

**Purpose:**
This document provides concise, actionable context for Cursor AI agents when they receive the *Paste-ready detailed prompt* for NeuralLift. Paste this file into the agent's context or supply it to Cursor AI before asking it to generate code, UI, or product artifacts.

---

## Project snapshot

**Name:** NeuralLift
**Tagline:** "Science-based lifting tailored to you"
**One-line:** A visually-stunning, Apple-like web app that generates a personalized, science-rooted 12-week hypertrophy training program from a single-question-per-page onboarding flow. Week 1 is free; the remaining 11 weeks are gated by a \$9.99 Stripe payment.

---

## High-level goals

* Deliver an ultra-simplified, highly-tailored hypertrophy program generator that reads like a modern coaching product.
* Prioritize design: modern, colorful, crisp, Apple-like UI with large rounded corners, soft shadows, and clear microcopy.
* Provide reproducible, science-based exercise selection, weekly volume targets, progression rules, rest/tempo guidance, and safety fallbacks.
* Ship a developer-ready implementation for Next.js + Tailwind + Supabase + Stripe + GPT (server-side program generation).

---

## Target users & personas

* Primary: 20–40 y/o gym-goers who care about evidence-based hypertrophy and want an easy, aesthetic, automated program generator.
* Secondary: coaches who need a quick program skeleton to customize and clients who want simple, structured plans.

---

## Core features (quick list)

1. Landing page with strong hero CTA: "Create your own science-based training program now".
2. Google Sign-in & Supabase auth (one-click account creation).
3. One-question-per-page onboarding flow (10 questions max) to collect data for program generation.
4. AI-driven 12-week hypertrophy program generator (GPT-assisted + deterministic rules) returning a JSON program and a UI render.
5. Program page: week-by-week layout (12 weeks) with day tabs and exercise cards.
6. Dashboard: PR tracking (big 3), progress graphs, ValidityCard explaining rationale + sources.
7. Monetization: week1 free, weeks 2–12 gated at \$9.99 via Stripe; pay to generate new program.
8. Loading generation UI: animated progress bar with dynamic microcopy referencing user answers.

---

## Onboarding questions (one-per-page)

Use these exactly (or close) as the 10-step onboarding. Keep answers short — they are used to fill dynamic microcopy in the loading UI.

1. Primary goal: \[Hypertrophy, Strength, Recomp, Power]
2. Experience level: \[Beginner, Intermediate, Advanced]
3. Available training days/week: \[3, 4, 5, 6]
4. Equipment: \[Full gym, Barbell + dumbbells, Dumbbells only, Bands only, Bodyweight]
5. Big 3 PRs (units): bench, squat, deadlift (user can toggle lbs/kg)
6. Preferred split: \[Push/Pull/Legs, Upper/Lower, Full body, Custom]
7. Session length (minutes): \[30, 45, 60, 90]
8. Injuries / mobility notes (free text)
9. Rest preference: \[Auto — recommended, Custom (seconds)]
10. Nutrition status: \[Caloric surplus, maintenance, deficit]

---

## Program generation constraints & deterministic rules

These rules must always be enforced by the program generator (GPT may be used to craft copy and assist with exercise selection but deterministic rules are authoritative):

**Program structure**

* 12 weeks total. Render as `weeks[1..12]` with `days` per week matching `user.training_days`.
* Each day contains an ordered list of exercises: compound primary lifts first, compound variations second, accessory isolation last.

**Per-muscle weekly effective sets targets (by experience)**

* Beginner: 10–14 effective sets/week per muscle group
* Intermediate: 14–18 sets/week
* Advanced: 18–26 sets/week

**Rep ranges**

* Hypertrophy main lifts: 6–12 (primary emphasis 8–12)
* Accessories: 8–20
* Heavy accumulation phases: 4–6 or 5–8 for strength-focused blocks

**Progression rules**

* Default block: 3 accumulation weeks followed by 1 deload week (configurable based on experience/goal)
* Microprogression: +2.5–5 lbs when last set RPE ≤ 7 for two sessions
* Warmup algorithms: 3–4 warmup sets ramping to working set intensity using PR-based % conversions

**Rest & tempo**

* Default tempo: 2-0-1
* Rest: 120s-210s for compound; 120s-180s for accessory

**Safety**

* If `injuries` reference certain movements, provide safe swap suggestions and mark high-risk items with a caution flag.
* If equipment unavailable, replace with suitable alternatives or bodyweight progressions.

**Monetization gating**

* Week 1 visible (free) for authenticated users (or demo for guests); attempting to view weeks 2–12 triggers Stripe checkout flow.
* After successful payment webhook, set `program.paid = true` in Supabase and allow full access.

---

## Data model (minimal)

**User**

```json
{ "id": "uuid", "email":"", "name":"", "created_at":"ISO", "profile": { "age":null, "sex":null, "weight":null }}
```

**Program**

```json
{
  "program_id":"uuid",
  "user_id":"uuid",
  "paid": false,
  "created_at":"ISO",
  "metadata": {"training_days":5, "experience":"Intermediate", "goal":"Hypertrophy"},
  "weeks": [ ... ]
}
```

**PRs**

```json
{ "user_id":"uuid", "bench":185, "squat":185, "deadlift":225, "history": [{"date":"ISO","bench":180}], }
```

---

## Tech & integrations (assumed)

* Frontend: Next.js (app router), React, Tailwind CSS
* Backend & auth: Supabase (Google SSO + DB + serverless functions)
* Payments: Stripe Checkout + webhooks
* AI: GPT (use GPT-4o or equivalent for code/copy output; use deterministic temp 0–0.3 for program rules)
* Hosting: Vercel (recommended)

Env vars (placeholders):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_PROGRAM_UNLOCK
NEXTAUTH_URL (if using NextAuth)
```

---

## UX flows (concise)

**Landing → Create Program**

* Click CTA → Google Sign-in popup (if not logged in) → Onboarding (one question per page) → Final page “Start your journey” → Show LoadingGeneration UI → /api/generate-program called → create `program` in DB with `paid=false` → Render ProgramPage showing week 1 (unlocked) and weeks 2–12 blurred with lock CTA.

**Gating & purchase flow**

* Click locked-week CTA -> POST `/api/stripe-create-session` -> Stripe Checkout -> webhook updates `program.paid = true` -> redirect to program page (full access).

**PR update flow**

* On Dashboard, update PRs -> show upsell toast/modal: "Looks like you’ve gotten stronger — regenerate up-to-date program?" -> if user clicks -> take to Stripe flow (or, if free regeneration policy exists, call generator directly) -> on success, update program.

---

## Acceptance criteria (must be validated)

1. Onboarding is one-question-per-page and saved as a complete JSON payload to the server before generation.
2. Program generator endpoint returns a valid `program.schema.json` payload and the UI renders week 1 correctly.
3. Gating: unauthenticated users or users without `program.paid` only can view week1. Attempting to access other weeks triggers Stripe flow.
4. PR dashboard updates trigger the upsell modal and do not auto-generate a paid program without user consent.
5. Accessibility: basic a11y checks pass (focusable controls, labels, role attributes, contrast for body text ≥ 4.5:1).
6. Performance: program page lazy-loads program data and does not block initial navigation.

---

## What Cursor AI should output when given the detailed prompt

When you feed the *Paste-ready detailed prompt* into Cursor AI along with this `context.md`, expect Cursor to output:

* Design spec + Tailwind tokens, component files, and TSX examples.
* `program.schema.json` and a sample 12-week payload (or truncated 1-week sample for brevity).
* API handlers for `/api/generate-program` and `/api/stripe-session` with Supabase/Stripe snippets.
* Acceptance tests and README with env var placeholders.
* Clear inline markers where human review or citation is required for research-backed rules.

**Important:** In outputs that state research-based claims, include short citations (URL or DOI) in an adjacent `references` section; but keep production code free from long inlined citations — instead include a `program_generation_references.md` file.

---

## Sample program JSON (1-week excerpt for quick test)

```json
{
  "program_id":"sample-uuid-001",
  "name":"12-week Hypertrophy Program",
  "weeks":[
    {
      "week_number":1,
      "days":[
        {
          "day_number":1,
          "focus":"Push",
          "exercises":[
            {"id":"bp","name":"Barbell Bench Press","sets":4,"reps":"8-10","rpe":7,"tempo":"2-0-1","rest_seconds":90},
            {"id":"dbp","name":"Dumbbell Shoulder Press","sets":3,"reps":"8-12","rpe":7,"tempo":"2-0-1","rest_seconds":75}
          ]
        }
      ]
    }
  ],
  "metadata":{"created_at":"2025-08-12T00:00:00Z","source":["internal-rules"]}
}
```

---

## Brand voice & microcopy

* Voice: confident, science-first, encouraging.
* Primary CTAs: "Create your science-based program", "Unlock full 12 weeks", "Generate a new program".
* Loading messages: short, personal, and referencing user answers (e.g., "Fine-tuning volume to match your Intermediate experience level...").

---

## Operational notes / assumptions

* Default currency: USD.
* Default model determinism: temperature 0.0–0.3 for any program logic or code generation tasks.
* If the agent needs to cite research, prefer peer-reviewed meta-analyses or respected creators (Jeff Nippard, Mike Israetel) and attach a `program_generation_references.md` listing sources.

---

## Contact / ownership

* Primary owner: product lead (NeuralLift)
* Engineering lead: (fill in during implementation)

---

