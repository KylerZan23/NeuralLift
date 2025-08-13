## Bugfix: Identical 5-day plan generated regardless of onboarding answers

### Summary
Different new users were receiving the same 5-day program with the same exercises and weight suggestions. Root causes:

- Silent defaults in onboarding submission forced `days_per_week` to 5 and PRs to 185/185/225 when answers were missing or not propagated.
- The LLM generation path could overwrite personalized content with a deterministic template if day counts mismatched.

### Changes

- Remove fallback defaults in onboarding payload to ensure only actual user answers are sent.
- Relax program enforcement to adjust only the number of days and `day_number` sequence, preserving LLM-provided day contents.

### Impact

- Users will see variations in exercises and suggested weights aligned with their input.
- LLM output is preserved except for non-destructive day-count normalization.

### Notes

- If `OPENAI_API_KEY` is unset, generation still uses deterministic templates. However, users will now get accurate weight suggestions based on their entered PRs instead of hardcoded defaults.


