import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Flat structure (correct for current SDK)
    const response = await duffel.orders.create({
      type: 'instant',
      selected_offers: [body.offerId],
      passengers: body.passengers,
      services: body.services || [],
      payments: [
        {
          type: 'balance',
          currency: body.currency,
          amount: body.finalAmount,
        },
      ],
    });

    const order = response.data; // actual order is inside .data

    return NextResponse.json({
      success: true,
      order: order,
      booking_reference: order.booking_reference,
      id: order.id,
    });
  } catch (error: any) {
    console.error('Duffel order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
