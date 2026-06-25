import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const order = await duffel.orders.create({
      data: {
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
      },
    });

    return NextResponse.json({
      success: true,
      order: order.data,
      booking_reference: order.data.booking_reference,
      id: order.data.id,
    });
  } catch (error: any) {
    console.error('Duffel order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
