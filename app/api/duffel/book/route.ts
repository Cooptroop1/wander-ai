// app/api/duffel/book/route.ts
// Clean Hold + Pay version using the user's offerId

import { NextRequest, NextResponse } from 'next/server';
import { DuffelService } from '@/lib/duffel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, amount, currency } = body;

    if (!offerId || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const duffel = new DuffelService(process.env.DUFFEL_ACCESS_TOKEN!);

    // Use clean passengers without pre-existing IDs
    // (Duffel will accept this for basic hold orders)
    const passengers = [
      {
        phone_number: '+442080160508',
        email: 'tony@example.com',
        born_on: '1980-07-24',
        title: 'mr',
        gender: 'm',
        family_name: 'Stark',
        given_name: 'Tony',
      },
      {
        phone_number: '+442080160509',
        email: 'potts@example.com',
        born_on: '1983-11-02',
        title: 'mrs',
        gender: 'f',
        family_name: 'Potts',
        given_name: 'Pepper',
      },
    ];

    // Step 1: Create HOLD order using the user's offerId
    const holdOrder = await duffel.createHoldOrder({
      offerId,
      passengers,
      services: [],
    });

    // Step 2: Pay the hold order
    const paidOrder = await duffel.payForHoldOrder(
      holdOrder.id,
      amount,
      currency
    );

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
