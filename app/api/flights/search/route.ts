import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, departDate, passengers = 1 } = body;

    if (!from || !to || !departDate) {
      return NextResponse.json({ error: 'Missing from/to/date' }, { status: 400 });
    }

    const duffel = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN!,  // ← your Vercel env var name
    });

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: from,
          destination: to,
          departure_date: departDate,
        },
      ],
      passengers: Array.from({ length: passengers }, () => ({ type: 'adult' })),
      cabin_class: 'economy',
      return_offers: true,
    });

    return NextResponse.json({
      success: true,
      offerRequestId: offerRequest.id,
      offers: offerRequest.offers?.slice(0, 5) || [],  // top 5 real offers
      message: 'Real Duffel API data returned!',
    });

  } catch (error: any) {
    console.error('Duffel error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'API failed – check your DUFFEL_ACCESS_TOKEN is correct and sandbox mode',
      tip: 'Make sure token starts with duffel_test_ and is in Vercel env',
    }, { status: 500 });
  }
}
