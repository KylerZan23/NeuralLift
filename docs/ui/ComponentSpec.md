# NeuralLift — Figma-like Component Spec + Storybook (CSF)

## Overview / how to use
This doc contains design tokens, component anatomy, states, motion, accessibility, and CSF stories for NeuralLift’s core UI. Map tokens to Tailwind in `styles/design-tokens.ts` and CSS variables in `app/globals.css`. Stories import from `components/*` and live in `stories/*`.

## 1. Design tokens (map to Tailwind)
- --color-primary-500: #5B8CFF
- --color-primary-600: #386BFF
- --color-accent-500: #7AE3B1
- --color-bg: linear-gradient(180deg, #FBFDFF 0%, #F6F9FF 100%)
- --color-surface: rgba(255,255,255,0.9)
- --color-elevated: rgba(255,255,255,0.7)
- --color-outline: rgba(13, 24, 46, 0.06)
- --color-text: #0D172E
- --color-muted: #657085
- --color-success: #10B981
- --color-warning: #F59E0B
- --color-danger: #EF4444

Typography: H1 48/56 700, H2 34/40 600, H3 24/32 600, Body 16/24 400, Caption 14/20 500. Font: Inter.
Spacing (8px base): xs 4, sm 8, md 16, lg 24, xl 32, xxl 48. Radii: 6/12/24. Shadows: sm (0 1 2 / .04), md (0 8 24 / .08).
Motion: fast 120ms, med 240ms, slow 420ms; easing cubic-bezier(.2,.9,.3,1). Micro: hover scale+fade; onboarding slide X spring.

## 2. Component anatomy & variants
- Button: primary/secondary/ghost/danger; sm/md/lg; focus ring; disabled.
- Card: header/body/footer; compact/default/media.
- OnboardingQuestion: progress, question, control, help, CTA.
- ProgramWeekView: week header, day tabs, exercise list.
- PRDashboard: PR inputs + save.
- ValidityCard: tone + summary.
- LoadingGeneration: progress bar + messages.

## 3. Motion & interactions
- Onboarding slide X spring (stiffness 240, damping 22).
- CTA hover scale 1.02; loading messages stagger fade 100–200ms.
- ProgramWeekView day switch: crossfade + vertical slide.
- Respect prefers-reduced-motion.

## 4. Accessibility
- Contrast >= 4.5:1 for body text, focus-visible rings, labels for inputs, aria-live for dynamic, modal focus trap.

## 5. Storybook notes
- Framework: `@storybook/nextjs`. Addons: essentials, a11y, interactions.
- Tailwind via `app/globals.css` in `preview.ts`.
- Stories use CSF v3 with args/controls and optional play functions.

## 6. Integration notes
- Import components from `components/*` in Next.js pages.
- Use CSS variables in `globals.css` to reflect tokens and ensure consistency with Tailwind utilities.
