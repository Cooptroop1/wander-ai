import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, markupPercent = 10 } = body;  // markup % you add

    const duffel = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN!,
    });

    const order = await duffel.orders.create({
      selected_offers: [offerId],
      type: 'instant',
      passengers: [
        {
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
          amount: "500.00"  // base + your markup
        }
      ],
      services: [
        {
          type: "baggage",
          quantity: 1,
          passenger_ids: ["passenger_0"],
          metadata: { type: "checked" }
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
      message: '✅ Booked and paid with your markup! (real Duffel order created)'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      tip: 'Use real offerId from search and make sure token is valid'
    }, { status: 500 });
  }
}
