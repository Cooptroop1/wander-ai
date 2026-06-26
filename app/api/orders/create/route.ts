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
    // Log the full error so we can see the real reason
    console.error('=== DUFFEL ERROR ===');
    console.error(JSON.stringify(error, null, 2));

    const duffelError = error.errors?.[0]?.title || 
                        error.errors?.[0]?.message || 
                        error.message || 
                        'Unknown error from Duffel';

    return NextResponse.json({
      success: false,
      error: duffelError,
      fullError: error.errors || error.message,
    }, { status: 500 });
  }
}
