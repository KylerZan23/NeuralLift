# ADR-006: LLM-first Program Generation

- Status: Accepted
- Date: 2025-08-13

## Context
Programs were generated deterministically with optional GPT refinement. We want highly tailored, evidence-based programs rooted in modern research and aligned with creators like Jeff Nippard.

## Decision
Adopt an LLM-first generator using OpenAI to synthesize a full 12-week plan from onboarding inputs. Enforce strict JSON output structure matching `types/program.schema.json`. Validate via Ajv; attempt a single model-based repair on validation failures. Fall back to the deterministic generator on missing API key or model errors.

## Details
- New function `generateProgramWithLLM(input, { programId, citations })` in `lib/program-generator.ts`.
- Prompt encodes constraints: 12 weeks, 2–6 days, progression with 3:1 accumulation/deload, volume and intensity limits, exercise ordering, tailoring to equipment/injuries/preferences.
- API `POST /api/generate-program` uses the LLM path when `useGPT = true`.
- Onboarding now sends `useGPT: true` by default; server still falls back safely if `OPENAI_API_KEY` is absent.

## Consequences
- More personalized output; still robust via schema validation and fallback.
- Requires `OPENAI_API_KEY` configured for LLM path.
- Minimal runtime overhead due to single round-trip; minimal repair round on schema mismatch.

## Alternatives considered
- Deterministic only (insufficient personalization).
- LLM-only without validation (fragile).
- Function calling with strict schema (available later; current approach uses `response_format: json_object`).

## Notes
- Model: `gpt-4o` selected for higher reliability on structured JSON output
- Token limit: 16000 tokens for complete 12-week program generation
- **2025-08-19 Update**: Temporarily switched to `gpt-3.5-turbo` for cost optimization, but reverted to `gpt-4o` due to token limitations causing truncated programs

