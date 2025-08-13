# ADR-003 — Adopt Shadcn UI (Radix + Tailwind) for core primitives

## Context

The app used hand-rolled UI for Button, Input, Card, and a custom modal with manual focus trapping. This duplicated styles and a11y logic and made variants inconsistent.

## Decision

Adopt Shadcn UI patterns: Radix primitives styled with Tailwind and class-variance-authority. Add tailwind-merge, clsx and tailwindcss-animate. Introduce a shared cn helper.

Scope (phase 1): Dialog, Button, Input, Label, Card. Later: Tabs, Toast, Skeleton.

## Consequences

- Pros: Consistent variants, accessible Dialog, simpler forms, easier theming with brand tokens.
- Cons: New dependencies and minor refactors.

## Status

Accepted and implemented incrementally. Phase 1 complete.

## Implementation Notes

- Dependencies:
  - runtime: class-variance-authority, tailwind-merge, clsx, @radix-ui/react-dialog, @radix-ui/react-label, @radix-ui/react-tabs, lucide-react
  - dev: tailwindcss-animate
- Tailwind: enable darkMode: 'class', add tailwindcss-animate, bind CSS variables from app/globals.css to semantic colors.
- New components under components/ui/: button, card, input, label, dialog.
- Refactors:
  - components/GatingModal.tsx uses Dialog
  - components/PRDashboard.tsx uses Label, Input, Button
