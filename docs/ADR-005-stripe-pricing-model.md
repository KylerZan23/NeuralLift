# ADR-005 — Stripe pricing model uses Price IDs, not inline amounts

## Status
Accepted

## Context
Checkout sessions used inline `unit_amount`, which is brittle and requires code deploys to change pricing.

## Decision
Move to environment-provided `STRIPE_PRICE_PROGRAM_UNLOCK` (a Stripe Price ID). Use that in all checkout sessions.

## Consequences
- Pricing changes are performed in Stripe and via env changes.
- Webhook logging reflects amounts from Stripe session.


