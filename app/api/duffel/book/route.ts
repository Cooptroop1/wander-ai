// app/api/duffel/book/route.ts
// Full booking route for ai-assists.com

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DuffelService } from '@/lib/duffel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      offerId,
      passengers,
      services = [],
      amount,
      currency,
    } = body;

    if (!offerId || !passengers || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const duffel = new DuffelService(process.env.DUFFEL_ACCESS_TOKEN!);

    // 1. Create + pay the order on Duffel
    const paidOrder = await duffel.createAndPayOrder({
      offerId,
      passengers,
      services,
      totalAmount: amount,
      currency,
    });

    // 2. Save to Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('bookings').insert({
        user_id: user.id,
        duffel_order_id: paidOrder.id,
        booking_reference: paidOrder.booking_reference,
        status: 'booked',
        total_amount: paidOrder.total_amount,
        currency: paidOrder.total_currency,
        raw_order: paidOrder,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: paidOrder.id,
        booking_reference: paidOrder.booking_reference,
        total_amount: paidOrder.total_amount,
        currency: paidOrder.total_currency,
      },
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
