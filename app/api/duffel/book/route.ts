// app/api/duffel/book/route.ts
// Booking API route for ai-assists.com
// Handles creating + paying for a flight order using Duffel Balance
// Call this route AFTER the customer has successfully paid via Stripe

import { NextRequest, NextResponse } from 'next/server';
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
        { error: 'Missing required fields: offerId, passengers, amount, currency' },
        { status: 400 }
      );
    }

    const duffel = new DuffelService(process.env.DUFFEL_TOKEN!);

    // Step 1: Create a hold order first (safer)
    const holdOrder = await duffel.createHoldOrder({
      offerId,
      passengers,
      services,
    });

    // Step 2: Pay the hold order using your Duffel Balance
    const paidOrder = await duffel.payForHoldOrder(
      holdOrder.id,
      amount,
      currency
    );

    // TODO: Later we will add Supabase save here

    return NextResponse.json({
      success: true,
      order: {
        id: paidOrder.id,
        booking_reference: paidOrder.booking_reference,
        status: paidOrder.status,
        total_amount: paidOrder.total_amount,
        currency: paidOrder.total_currency,
      },
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to create booking',
        details: error.errors || null,
      },
      { status: 500 }
    );
  }
}
