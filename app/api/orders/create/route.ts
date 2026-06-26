import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const isHold = body.type === 'hold';

    const orderData: any = {
      type: isHold ? 'hold' : 'instant',
      selected_offers: [body.offerId],
      passengers: body.passengers,
      services: body.services || [],
    };

    // Only add payment for instant bookings
    if (!isHold) {
      orderData.payments = [
        {
          type: 'balance',
          currency: body.currency || 'GBP',
          amount: body.finalAmount,
        },
      ];
    }

    const response = await duffel.orders.create(orderData);
    const order = response.data;

    return NextResponse.json({
      success: true,
      order,
      booking_reference: order.booking_reference,
      id: order.id,
    });

  } catch (error: any) {
    console.error('Duffel API Error:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error from Duffel',
      details: error.errors || null, // This often contains the real reason
    }, { status: 500 });
  }
}
