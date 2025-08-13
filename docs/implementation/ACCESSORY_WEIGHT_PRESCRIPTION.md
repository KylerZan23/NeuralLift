## Accessory Weight Prescription from Big-3 PRs

This feature personalizes training by prescribing a specific working weight for accessory lifts based on the user's Big-3 PRs collected during onboarding. The same prescription is used regardless of the programmed rep range.

### Formula

1. Big-3 1RM inputs from onboarding: bench, squat, deadlift
2. Map accessory to correlated Big-3 and ratio range (by exercise):

| Accessory Lift | Based on | Ratio |
| --- | --- | --- |
| Overhead Press (Barbell) | Bench | 0.55–0.65 |
| Dumbbell Bench Press | Bench | 0.75–0.85 |
| Incline Bench Press | Bench | 0.65–0.75 |
| Triceps Pushdown | Bench | 0.35–0.45 |
| Barbell Row | Deadlift | 0.45–0.55 |
| Pull-Up (added load) | Deadlift | 0.35–0.45 |
| Lat Pulldown | Deadlift | 0.45–0.55 |
| Front Squat | Back Squat | 0.70–0.80 |
| Bulgarian Split Squat (per leg) | Back Squat | 0.35–0.45 |
| Romanian Deadlift | Deadlift | 0.60–0.70 |
| Bicep Curl (barbell) | Bench | 0.25–0.35 |

3. Accessory 1RM = Big-3 1RM × Ratio
4. Working weight for display = Accessory 1RM × 0.82 (single point)
5. Experience adjustment for ratio selection:
   - Beginner → use midpoint of range
   - Intermediate → use upper bound of range
   - Advanced → use upper bound of range

Additional implementation choices:
- Rounding: nearest 5 lb for practicality
- Display: “Suggested: X lb” under exercises where a mapping exists

### Reference Table (expanded key examples)

See code `ACCESSORY_MAPPINGS` in `lib/weight-prescription.ts` for patterns and ranges including: OHP (barbell, dumbbell), incline presses (barbell/dumbbell), CGBP, dips, rows (barbell/pendlay/dumbbell), pull-ups, pulldowns, face pull, front squat, Bulgarian split squat, walking lunge, RDL, hip thrust, leg press, leg extension, leg curl, curls (barbell/dumbbell/hammer), lateral raise, shrugs (barbell/dumbbell).

### Integration Points

- UI: `components/ProgramWeekView.tsx` — renders suggested weight under each exercise
- Data: PRs loaded from `prs` table on program page via Supabase client
- Logic: `lib/weight-prescription.ts` — pure function `computeSuggestedWorkingWeight(name, prs, experience)`

### Notes

- If an exercise has no mapping (e.g., leg press, abs), no suggestion is shown.
- Experience defaults to Intermediate when unavailable in program metadata.
- Does not modify program schema; purely presentational.


