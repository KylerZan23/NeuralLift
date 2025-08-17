# ADR-014: Program Display Format Simplification

## Status
Accepted

## Context
User feedback and training science considerations led to a need to simplify how training programs are displayed and generated. The existing format included detailed RPE values, tempo prescriptions, intensity percentages, and variable rest times that were creating complexity without providing proportional training benefit.

## Decision
We have implemented the following changes to simplify program display and generation:

### Changes Made

1. **RPE → RIR 0-1**: Changed from variable RPE (7-8) to consistent "RIR 0-1" display
2. **Remove Tempo**: Eliminated tempo prescriptions (e.g., "2-0-1") from all exercises
3. **Remove Intensity %**: Removed percentage display on main compound lifts (e.g., "72%")
4. **Standardize Rest**: Changed all rest periods to 3 minutes (180 seconds) regardless of exercise type
5. **Fix Hover Messages**: Fixed dumbbell exercise hover tooltips and added machine exercise warnings
6. **Add Machine Tooltips**: Added "weight dependent on machine type" tooltips for machine exercises

### Technical Implementation

**UI Changes (`components/ProgramWeekView.tsx`)**:
- Updated display format from `RPE {ex.rpe} · Tempo {ex.tempo}` to `RIR 0-1`
- Removed intensity percentage display entirely
- Enhanced hover tooltip logic for dumbbell and machine exercises

**Program Generation (`lib/core/program-generator.ts`)**:
- Changed all `rpe` values from 7-8 to 1 (representing RIR 0-1)
- Set all `tempo` fields to empty string
- Standardized all `rest_seconds` to 180
- Removed `intensity_pct` from exercise generation logic
- Updated `buildAccessory()` function to use new format

**Sample Data Updates**:
- Updated marketing page sample exercises
- Updated context documentation
- Updated system prompts for LLM generation

## Consequences

### Positive
- **Simplified User Experience**: Cleaner, less overwhelming program display
- **Reduced Cognitive Load**: Fewer parameters for users to track and understand
- **Improved Consistency**: All exercises follow the same rest and intensity format
- **Better Accessibility**: Simpler format is easier for beginners to follow
- **Enhanced Machine Support**: Clear guidance for machine-dependent exercises

### Negative
- **Reduced Granularity**: Less specific guidance for advanced users who might benefit from varied rest periods
- **Lost Information**: Tempo prescriptions may have provided some training value
- **Training Periodization**: Less sophisticated periodization options with simplified format

### Neutral
- **Backward Compatible**: Existing data structure remains valid, only display changes
- **Maintains Core Functionality**: Program generation and weight suggestions unchanged
- **Preserves User Data**: No existing user programs are affected

## Alternatives Considered

1. **Configurable Complexity**: Allow users to toggle between simple/advanced views
   - Rejected: Added UI complexity without clear user demand
   
2. **Gradual Transition**: Keep some complexity while simplifying others
   - Rejected: Inconsistent experience, partial benefit
   
3. **Advanced User Mode**: Separate mode for experienced lifters
   - Rejected: Would fragment user base and complicate development

## Implementation Details

- All changes maintain backward compatibility with existing program data
- System prompts updated to reflect new generation rules
- Tests continue to pass with new format
- Machine exercise detection uses regex pattern matching
- Hover tooltips now provide contextual information based on exercise type

## Validation

- Program generation tests pass with new format
- UI displays correctly with simplified information
- Weight prescription system unaffected
- Backward compatibility maintained for existing programs

## Related Documents
- [Weight Percentage Adjustments](./ADR-013-weight-percentage-adjustments.md)
- [Program Generation Documentation](./lib/core/program-generator.ts)

## Date
2025-01-13
