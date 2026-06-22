import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = await request.json();

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Origin, destination and departure date are required' }, { status: 400 });
    }

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          departure_date: departureDate,
        } as any,  // ← This fixes the TS complaint for now
        ...(returnDate ? [{
          origin: destination.toUpperCase(),
          destination: origin.toUpperCase(),
          departure_date: returnDate,
        } as any] : []),
      ],
      passengers: Array.from({ length: Number(passengers) }, () => ({ type: 'adult' as const })),
      cabin_class: cabinClass as any,
      max_connections: 1,
    });

    return NextResponse.json({
      success: true,
      offers: offerRequest.data.offers?.slice(0, 10) || [],
      offerRequestId: offerRequest.data.id,
    });

  } catch (error: any) {
    console.error('Duffel error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to search flights' 
    }, { status: 500 });
  }
}
