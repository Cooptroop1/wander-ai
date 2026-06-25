import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, markupPercent = 10 } = body;

    const duffel = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN!,
    });

    const order = await duffel.orders.create({
      selected_offers: [offerId],
      type: 'instant',
      passengers: [
        {
          id: 'passenger_0',
          given_name: "John",
          family_name: "Doe",
          born_on: "1990-01-01",
          gender: "m",
          email: "john@example.com",
          phone_number: "+441234567890",
          title: "mr"
        }
      ],
      payments: [
        {
          type: "balance",
          currency: "GBP",
          amount: "550.00"  // base + markup (you keep the extra £50)
        }
      ],
      metadata: {
        your_markup: markupPercent + "% added (£50 example)",
        customer_id: "user123"
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      bookingReference: order.booking_reference,
      message: '✅ Booked and paid with markup! (real Duffel order created)'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      tip: 'Use real offerId from search'
    }, { status: 500 });
  }
}
