import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Wander AI Pro',
              description: '20 AI Trip Ideas Per Month + AI Booking Helper + Save Ideas • Cancel anytime',
            },
            unit_amount: 299,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-assists.com'}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-assists.com'}?canceled=true`,
      metadata: { user_id: userId, plan: 'pro' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ 
      error: 'Failed to start checkout. Please try again or contact support.' 
    }, { status: 500 });
  }
}
