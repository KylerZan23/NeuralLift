# ADR-016: RPE Schema Validation Fix

## Status
Accepted

## Context
Program generation was failing in production due to schema validation errors. The issue occurred after implementing the UI simplification that changed from displaying RPE values to "RIR 0-1".

### Problem
When we simplified the UI to show "RIR 0-1" instead of specific RPE values, we also changed the underlying data values from RPE 7-8 to RPE 1. However, the JSON schema still required RPE values to be >= 5, causing all program generation to fail with validation errors:

```
"rpe": { "type": "number", "minimum": 5, "maximum": 10 }
```

Every exercise was failing with: `must be >= 5`

## Decision
Fix the data layer to comply with existing schema requirements while maintaining the simplified UI display.

### Solution Implemented
1. **Corrected RPE Values**: Changed all RPE values in program generator from 1 to 7
2. **Maintained UI Display**: UI continues to show "RIR 0-1" regardless of stored RPE value
3. **Updated Sample Data**: Fixed marketing page and documentation examples
4. **Updated System Prompts**: LLM prompts now specify RPE 5-10 for data storage

### Files Changed
- `lib/core/program-generator.ts`: Changed all `rpe: 1` to `rpe: 7`
- `app/(marketing)/page.tsx`: Updated sample exercise data
- `context.md`: Updated documentation examples

## Alternatives Considered

1. **Update Schema**: Change minimum RPE requirement from 5 to 1
   - Rejected: Would require schema migration and potentially break other systems
   - Backward compatibility concerns

2. **Remove RPE Field**: Make RPE optional or remove entirely
   - Rejected: Field may be used by other parts of system
   - Larger architectural change

3. **Use Different Storage Value**: Store a different value that maps to RIR
   - Rejected: More complex than simply using valid RPE values

## Consequences

### Positive
- ✅ **Production Fixed**: Program generation works immediately
- ✅ **UI Unchanged**: Users still see "RIR 0-1" as intended
- ✅ **Schema Compliance**: All data meets validation requirements
- ✅ **Backward Compatible**: No breaking changes to existing data structures
- ✅ **Minimal Changes**: Simple value adjustment rather than architectural changes

### Negative
- **Data Semantics**: RPE 7 stored doesn't exactly match "RIR 0-1" concept
- **Abstraction Layer**: UI display now differs from stored data value

### Neutral
- **No User Impact**: Users see the same simplified interface
- **No Breaking Changes**: All existing APIs and data structures unchanged

## Implementation Details

**Before (Broken)**:
```typescript
rpe: 1  // Causes schema validation failure
```

**After (Fixed)**:
```typescript
rpe: 7  // Meets schema requirements (5-10 range)
```

**UI Display (Unchanged)**:
```
3 sets × 8-10 reps · RIR 0-1 · Rest 3m
```

## Validation
- ✅ Build passes TypeScript checks
- ✅ Schema validation requirements met
- ✅ UI displays correctly
- ✅ No breaking changes to existing systems

## Related Documents
- [ADR-014: Program Display Format Simplification](./ADR-014-program-display-format-simplification.md)
- [Program Schema](../types/program.schema.json)

## Date
2025-01-13
