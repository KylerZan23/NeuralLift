# ADR-009: Zustand State Management for Onboarding Flow

**Date:** 2024-12-19  
**Status:** Accepted  
**Decision Makers:** Architecture Team  

## Context

The onboarding flow required a mechanism to capture Personal Record (PR) data from unauthenticated users and transfer it to the dashboard for authenticated users. The original implementation used localStorage for this handoff, which proved fragile and difficult to maintain.

### Original Implementation Issues

```typescript
// Fragile localStorage implementation
try {
  localStorage.setItem('pending_prs', JSON.stringify({
    bench: Number(state['big3_bench']),
    squat: Number(state['big3_squat']),
    deadlift: Number(state['big3_deadlift'])
  }));
} catch {}

// Multiple try/catch blocks throughout codebase
try {
  const raw = localStorage.getItem('pending_prs');
  if (raw) {
    const pending = JSON.parse(raw);
    setBench(pending.bench ?? '');
  }
} catch {}
```

**Problems:**
- Excessive try/catch error handling
- No type safety for stored data
- Manual JSON serialization/deserialization
- Difficult to test reliably
- Browser storage dependency
- Scattered cleanup logic

## Decision

We will adopt **Zustand** as a lightweight state management solution for the onboarding flow's ephemeral state needs.

### Why Zustand?

1. **Lightweight**: ~2KB bundle size, minimal overhead
2. **TypeScript Native**: Excellent TypeScript support out of the box
3. **Simple API**: Easy to learn and use
4. **React Optimized**: Built specifically for React applications
5. **Testing Friendly**: Easy to test with React Testing Library
6. **Zero Configuration**: No providers or complex setup required

## Alternatives Considered

### 1. Continue with localStorage
- **Pros**: No new dependencies, persistence across sessions
- **Cons**: Fragile error handling, no type safety, difficult to test
- **Decision**: Rejected due to maintenance burden and fragility

### 2. React Context + useReducer
- **Pros**: Built-in React solution, no external dependencies
- **Cons**: Verbose setup, provider complexity, harder to optimize
- **Decision**: Rejected due to complexity for simple state needs

### 3. Redux Toolkit
- **Pros**: Mature, powerful, great DevTools
- **Cons**: Overkill for simple state, larger bundle size, complex setup
- **Decision**: Rejected due to being overpowered for the use case

### 4. Jotai
- **Pros**: Atomic state, good TypeScript support
- **Cons**: Different mental model, less familiar to team
- **Decision**: Rejected in favor of Zustand's simplicity

## Implementation

### Store Definition
```typescript
// lib/state/onboarding-store.ts
interface OnboardingState {
  pendingPRs: Record<string, number>;
  setPendingPR: (lift: string, weight: number) => void;
  clearPendingPRs: () => void;
  getPendingPRs: () => Record<string, number>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  pendingPRs: {},
  setPendingPR: (lift, weight) => set((state) => ({
    pendingPRs: { ...state.pendingPRs, [lift]: weight }
  })),
  clearPendingPRs: () => set({ pendingPRs: {} }),
  getPendingPRs: () => get().pendingPRs,
}));
```

### Usage Pattern
```typescript
// Component usage
const { pendingPRs, setPendingPR, clearPendingPRs } = useOnboardingStore();

// Type-safe operations
setPendingPR('bench', 225);
if (pendingPRs.bench) setBench(pendingPRs.bench);
clearPendingPRs();
```

## Consequences

### Positive
- ✅ **Improved Developer Experience**: Type-safe, clean API
- ✅ **Better Testability**: Easy to mock and test state changes
- ✅ **Reduced Error Handling**: No more try/catch blocks for basic operations
- ✅ **Centralized Logic**: All state management in one place
- ✅ **Performance**: No JSON serialization overhead
- ✅ **Maintainability**: Cleaner, more readable code

### Neutral
- 🔄 **New Dependency**: Added zustand@5.0.7 (~2KB)
- 🔄 **Learning Curve**: Team needs to learn Zustand patterns (minimal)
- 🔄 **State Persistence**: Memory-based (resets on page refresh)

### Negative
- ❌ **No Automatic Persistence**: State doesn't survive page refresh
  - **Mitigation**: This is actually desired for security/UX reasons
  - **Future Option**: Can add persistence middleware if needed

## Usage Guidelines

### When to Use Zustand
- ✅ Client-side ephemeral state
- ✅ Cross-component state sharing
- ✅ Complex state logic that benefits from centralization
- ✅ State that needs to be easily testable

### When NOT to Use Zustand
- ❌ Server state (use React Query/SWR)
- ❌ URL state (use Next.js router)
- ❌ Form state (use form libraries)
- ❌ Simple local component state (use useState)

### Best Practices
1. **Keep Stores Focused**: One store per feature/domain
2. **Type Everything**: Always define TypeScript interfaces
3. **Use Selectors**: Optimize re-renders with specific selectors
4. **Test Store Logic**: Unit test store operations
5. **Document State Shape**: Clear interfaces and JSDoc comments

## Monitoring and Success Metrics

### Code Quality
- Reduced try/catch blocks in onboarding flow
- Improved TypeScript coverage
- Cleaner component code

### Developer Experience
- Faster development of state-related features
- Better debugging experience
- Easier testing

### Performance
- No measurable impact on bundle size (<2KB)
- Improved runtime performance (no JSON operations)
- Optimized React re-renders

## Future Considerations

### Expansion Opportunities
1. **Other Onboarding State**: Expand store for other onboarding data
2. **User Preferences**: Store user UI preferences
3. **Draft Content**: Temporary draft state for forms

### Technical Enhancements
1. **Persistence Middleware**: Add localStorage persistence if needed
2. **DevTools Integration**: Add Zustand DevTools for debugging
3. **SSR Support**: Add hydration support if server-side rendering required

## Migration Timeline

### Phase 1: Core Implementation ✅
- Install Zustand
- Create onboarding store
- Refactor core components
- Add unit tests

### Phase 2: Validation ✅
- Run existing tests
- Manual testing of user flows
- Documentation creation

### Phase 3: Monitoring 🔄
- Monitor for any issues in production
- Gather developer feedback
- Consider expansion opportunities

## Related ADRs

- **ADR-003**: Shadcn UI Adoption - Complementary frontend architecture decision
- **Future**: Consider ADR for server state management if we adopt React Query

## References

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React State Management Comparison](https://kentcdodds.com/blog/application-state-management-with-react)
- [TypeScript Best Practices](https://typescript-eslint.io/docs/)
