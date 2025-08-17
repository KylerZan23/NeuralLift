# Weight Percentage Adjustments for Dumbbell Exercises

## Overview
Adjusting weight prescription percentages for specific dumbbell exercises that were reported as too heavy by users.

## Current vs New Percentages

| Exercise | Current Low-High | New Low-High | Reduction | Severity |
|----------|------------------|--------------|-----------|----------|
| Seated Dumbbell Shoulder Press | 40-50% | 32-42% | ~20% | Way too heavy |
| Incline Dumbbell Press | 45-55% | 37-47% | ~17% | Way too heavy |
| Dumbbell Bench Press | 75-85% | 65-75% | ~13% | Too heavy |
| Incline Dumbbell Curl | 15-25% | 12-20% | ~20% | Slightly too heavy |

## Rationale

### Seated Dumbbell Shoulder Press (40-50% → 32-42%)
- Most significant reduction due to "way too heavy" feedback
- Shoulder press requires more stabilization with dumbbells vs barbell
- New range better reflects realistic dumbbell shoulder press capability

### Incline Dumbbell Press (45-55% → 37-47%)
- Substantial reduction for "way too heavy" feedback
- Incline angle and dumbbell stability make this more challenging than flat
- Brings it more in line with other dumbbell pressing movements

### Dumbbell Bench Press (75-85% → 65-75%)
- Moderate reduction as this wasn't marked as "way too heavy"
- Still maintains higher percentage as it's most similar to barbell bench
- Accounts for dumbbell stabilization demands

### Incline Dumbbell Curl (15-25% → 12-20%)
- Smaller absolute change but significant percentage reduction
- "Slightly too heavy" feedback suggests modest adjustment needed
- Incline position makes curl more challenging than standard

## Impact Analysis

### User Experience
- More realistic starting weights for dumbbell exercises
- Better progression trajectory from accurate baselines
- Reduced risk of form breakdown from excessive weight

### System Consistency
- Maintains relative relationships between exercises
- Preserves experience level differentials (Beginner uses midpoint, Intermediate/Advanced use high end)
- Working weight multiplier (82%) remains unchanged

## Implementation Details

Changes made to `lib/core/weight-prescription.ts` in the `ACCESSORY_MAPPINGS` array:
- Line ~26: Dumbbell shoulder press pattern
- Line ~28: Incline dumbbell press pattern  
- Line ~29: Dumbbell bench press pattern
- Line ~60: Dumbbell curl pattern

## Testing Considerations

- Existing tests for weight prescription logic should continue to pass
- No tests specifically target the adjusted exercises
- Manual verification recommended with sample PRs to confirm reasonable outputs

## Related Documentation

- Update `docs/implementation/ACCESSORY_WEIGHT_PRESCRIPTION.md` with new percentages
- Consider adding user feedback mechanism for future weight adjustments
