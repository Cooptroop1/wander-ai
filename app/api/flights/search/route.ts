import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

console.log("Duffel token loaded?", !!process.env.DUFFEL_ACCESS_TOKEN); // debug line

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    const { origin, destination, departureDate } = body;

    if (!process.env.DUFFEL_ACCESS_TOKEN) {
      throw new Error("DUFFEL_ACCESS_TOKEN is missing on server");
    }

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: (origin || '').toUpperCase(),
          destination: (destination || '').toUpperCase(),
          departure_date: departureDate,
        } as any,
      ],
      passengers: [{ type: 'adult' as const }],
      cabin_class: 'economy' as any,
    });

    return NextResponse.json({
      success: true,
      offers: offerRequest.data.offers?.slice(0, 10) || [],
      offerRequestId: offerRequest.data.id,
    });

  } catch (error: any) {
    console.error("FULL ERROR:", error.message);
    return NextResponse.json({ 
      error: error.message,
      hint: "Check if token is set on Vercel + redeployed"
    }, { status: 500 });
  }
}
