import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Creating order with payload:', JSON.stringify(body, null, 2));

    const response = await duffel.orders.create({
      type: body.type || 'hold',
      selected_offers: [body.offerId],
      passengers: body.passengers,
      services: body.services || [],
    });

    const order = response.data;

    return NextResponse.json({
      success: true,
      order,
      booking_reference: order.booking_reference,
      id: order.id,
    });

  } catch (error: any) {
    console.error('=== DUFFEL FULL ERROR ===');
    console.error(JSON.stringify(error, null, 2));

    const duffelError = error.errors?.[0] || error.message || 'Unknown Duffel error';

    return NextResponse.json({
      success: false,
      error: duffelError,
      fullError: error,
    }, { status: 500 });
  }
}
