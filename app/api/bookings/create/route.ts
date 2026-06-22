import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { offerId, passenger } = await request.json();

    const order = await duffel.orders.create({
      selected_offers: [offerId],
      payments: [{
        type: "balance",
        currency: "GBP", // change to the currency of the offer
        amount: "0" // in real version you would charge the customer first
      }],
      passengers: [{
        phone_number: passenger.phone || "+441234567890",
        email: passenger.email,
        born_on: passenger.dob || "1990-01-01",
        title: "mr",
        gender: "m",
        family_name: passenger.lastName,
        given_name: passenger.firstName,
        id: "passenger_1"
      }]
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
