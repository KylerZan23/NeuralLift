# Implementation Plan: UI Component Migration

**Task 1.1: Complete the UI Component Migration**

**Goal:** Establish `/lib/ui` as the single source of truth for all primitive UI components, fully deprecating and removing the older, inconsistent components from the `/components` directory.

## Detailed Steps:

### 1. Identify Targets
- [ ] Scan the entire `/app` and `/components` directories for any usage of legacy, hand-rolled components (e.g., `components/Button.tsx`, `components/Card.tsx`). 
- [ ] Pay close attention to import paths. A global search for `from "@/components/Button"` and `from "@/components/Card"` will be performed.

### 2. Systematic Refactoring
- [ ] For each identified instance, refactor the code to use the corresponding primitive component from `/lib/ui`. 
- [ ] Ensure all props and event handlers are correctly mapped to the new component's API. For example, replace `<LegacyButton>` with `<Button variant="outline">`.
- [ ] A diff will be performed on the props of the legacy and new components to ensure API compatibility.

### 3. Update Storybook
- [ ] Modify `stories/Button.stories.tsx` and `stories/Card.stories.tsx` to import and showcase the components from `/lib/ui` exclusively. 
- [ ] Remove stories for the deprecated components.

### 4. Cleanup
- [ ] Once all instances have been refactored, delete the legacy component files (`components/Button.tsx`, `components/Card.tsx`).

### 5. Verification
- [ ] Run all unit and E2E tests (`yarn test`, `yarn playwright test`) to confirm that the UI remains visually consistent and functionally correct after the refactoring.
- [ ] Manually inspect the pages where components were changed to ensure no visual regressions.
