import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await duffel.orders.create({
      type: 'instant',
      selected_offers: [body.offerId],
      passengers: body.passengers,
      payments: [
        {
          type: 'balance',
          currency: 'GBP',
          amount: body.finalAmount || '120.39',
        }
      ],
    });

    const order = response.data;

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error('Duffel error:', JSON.stringify(error, null, 2));
    return NextResponse.json({
      success: false,
      error: error.errors?.[0] || error.message,
    }, { status: 500 });
  }
}
