// app/api/duffel/book/route.ts
// Booking route for ai-assists.com (Stripe + Duffel Balance)

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

    // Create and pay the order in one go
    const paidOrder = await duffel.createAndPayOrder({
      offerId,
      passengers,
      services,
      amount,
      currency,
    });

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
