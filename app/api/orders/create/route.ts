import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await duffel.orders.create({
      type: body.type === 'hold' ? 'pay_later' : 'instant',
      selected_offers: [body.offerId],
      passengers: body.passengers,
      // Do NOT include payments → this creates a hold
    });

    const order = response.data;

    return NextResponse.json({
      success: true,
      order,
      booking_reference: order.booking_reference,
      id: order.id,
    });

  } catch (error: any) {
    console.error('=== DUFFEL ERROR ===');
    console.error(JSON.stringify(error, null, 2));

    return NextResponse.json({
      success: false,
      error: error.errors?.[0] || error.message,
    }, { status: 500 });
  }
}
