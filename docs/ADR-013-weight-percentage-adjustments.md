# ADR-013: Weight Percentage Adjustments for Dumbbell Exercises

## Status
Accepted

## Context
User feedback indicated that certain dumbbell exercises were prescribing weights that were too heavy, resulting in poor form and potentially unsafe training conditions. After initial adjustments, additional feedback requested further reductions for Seated Dumbbell Shoulder Press and Incline Dumbbell Press. The weight prescription system uses percentage ratios of Big-3 PRs to calculate suggested working weights for accessory exercises.

## Decision
We will lower the percentage ratios for the following dumbbell exercises based on user feedback severity:

### Changes Made
- **Seated Dumbbell Shoulder Press**: 40-50% → 25-35% (37% total reduction, applied in two phases)
- **Incline Dumbbell Press**: 45-55% → 30-40% (33% total reduction, applied in two phases)
- **Dumbbell Bench Press**: 75-85% → 65-75% (13% reduction)
- **Incline Dumbbell Curl**: 15-25% → 12-20% (20% reduction)

## Consequences

### Positive
- More realistic starting weights for dumbbell exercises
- Better form maintenance due to appropriate loading
- Improved safety profile for dumbbell training
- Better user experience with more achievable weight suggestions

### Negative
- Some advanced users may find initial weights slightly light
- May require additional progression cycles for some users
- Reduces absolute loading for experienced lifters initially

### Neutral
- Maintains relative relationships between exercises
- Preserves experience level differentials in the algorithm
- Working weight multiplier (82%) remains unchanged

## Alternatives Considered
1. **Individual user calibration**: Too complex for initial implementation
2. **Equipment-specific modifiers**: Would require larger system changes
3. **Progressive adjustment based on feedback**: Lacks immediate user benefit

## Implementation Details
- Modified `ACCESSORY_MAPPINGS` array in `lib/core/weight-prescription.ts`
- Updated documentation in `ACCESSORY_WEIGHT_PRESCRIPTION.md`
- All existing tests continue to pass
- Changes are backward compatible

## Validation
- Existing weight prescription tests continue to pass
- No breaking changes to the API or user interface
- Gradual rollout allows for user feedback collection

## Related Documents
- [ACCESSORY_WEIGHT_PRESCRIPTION.md](./implementation/ACCESSORY_WEIGHT_PRESCRIPTION.md)
- [WEIGHT_PERCENTAGE_ADJUSTMENTS.md](./implementation/WEIGHT_PERCENTAGE_ADJUSTMENTS.md)

## Date
2025-01-13
