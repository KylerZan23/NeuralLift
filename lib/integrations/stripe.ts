import Stripe from 'stripe';
import { getEnv } from '@/lib/utils/env';

const env = getEnv();
export const stripe = new Stripe(env.STRIPE_SECRET, { apiVersion: '2024-06-20' });

export async function createCheckoutSession(opts: { programId: string; reason: 'unlock_full_program' | 'regenerate_program'; userId?: string }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    metadata: { programId: opts.programId, reason: opts.reason, userId: opts.userId ?? '' },
    line_items: [{ quantity: 1, price: env.STRIPE_PRICE_PROGRAM_UNLOCK }],
    success_url: `${env.NEXT_PUBLIC_BASE_URL}/program/${opts.programId}?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/program/${opts.programId}?checkout=cancelled`
  });
  return session.url;
}


