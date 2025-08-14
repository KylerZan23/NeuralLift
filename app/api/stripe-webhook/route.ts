import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { stripe } from '@/lib/stripe';
import { getServiceSupabaseClient } from '@/lib/supabase-server';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== 'payment' || session.payment_status !== 'paid') {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    const programId = session.metadata?.programId as string | undefined;
    const reason = session.metadata?.reason as 'unlock_full_program' | 'regenerate_program' | undefined;
    const userId = session.metadata?.userId as string | undefined;
    if (programId) {
      try {
        const supabase = getServiceSupabaseClient();
        // Idempotency: insert event id; if exists, skip
        const eventId = event.id as string;
        const { error: insertErr } = await supabase.from('stripe_events').insert({ id: eventId, type: event.type });
        if (!insertErr) {
          await supabase.from('programs').update({ paid: true }).eq('id', programId);
          // Log payment history
          await supabase.from('payment_history').insert({
            user_id: userId ?? null,
            program_id: programId,
            reason: reason ?? 'unlock_full_program',
            amount_cents: session.amount_total ?? 0,
            stripe_session_id: session.id
          });
        }
      } catch (e: any) {
        return NextResponse.json({ error: 'Processing error', details: e?.message ?? String(e) }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// App Router uses Web APIs; we read raw text above. bodyParser config is not used here.


