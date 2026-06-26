import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('=== Creating hold order ===');
    console.log('Offer ID:', body.offerId);
    console.log('Passengers:', JSON.stringify(body.passengers, null, 2));

    const response = await duffel.orders.create({
      type: 'hold',
      selected_offers: [body.offerId],
      passengers: body.passengers,
    });

    return NextResponse.json({
      success: true,
      order: response.data,
    });

  } catch (error: any) {
    console.error('=== DUFFEL ERROR ===');
    console.error(JSON.stringify(error, null, 2));

    // Try to extract the exact missing field
    const duffelError = error.errors?.[0];
    
    return NextResponse.json({
      success: false,
      error: duffelError?.title || duffelError?.message || error.message,
      details: duffelError,
      fullError: error.errors || error.message,
    }, { status: 500 });
  }
}
