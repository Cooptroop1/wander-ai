import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Use SERVICE ROLE key (server only, never expose to client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (userId) {
      console.log(`✅ Payment successful for user: ${userId}`);

      // Upgrade user to Pro
      await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);

      // Reset monthly usage count for trip_ideas
      const currentMonth = new Date().toISOString().slice(0, 7);
      await supabase
        .from('feature_usage')
        .upsert(
          {
            user_id: userId,
            feature: 'trip_ideas',
            count: 0,
            month: currentMonth,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,feature,month' }
        );
    }
  }

  // (Optional but recommended) Handle subscription cancellation later
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    // You can look up the user via customer ID if you store it
    console.log('Subscription cancelled:', subscription.id);
    // Add logic here later if you want to set is_pro = false
  }

  return NextResponse.json({ received: true });
}
