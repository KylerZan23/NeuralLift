import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET ?? '', { apiVersion: '2024-06-20' as any });

export async function createCheckoutSession(opts: { programId: string; reason: 'unlock_full_program' | 'regenerate_program'; userId?: string }) {
  const price = 999;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    metadata: { programId: opts.programId, reason: opts.reason, userId: opts.userId ?? '' },
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: price, product_data: { name: 'NeuralLift — 12-week program unlock' } } }],
    success_url: (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000') + `/program/${opts.programId}?checkout=success`,
    cancel_url: (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000') + `/program/${opts.programId}?checkout=cancelled`
  });
  return session.url;
}


