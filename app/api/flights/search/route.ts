
import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from = 'LHR', to = 'JFK', departDate = '2026-07-15' } = body;

    const duffel = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN!,  // ← your exact Vercel env var name
    });

    const offerRequest = await duffel.offerRequests.create({
      slices: [{
        origin: from,
        destination: to,
        departure_date: departDate,
      } as any],  // ← fixed TS type error
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy',
      return_offers: true,
    });

    return NextResponse.json({
      success: true,
      offers: offerRequest.offers || [],
      raw: offerRequest,  // for debugging
      message: '✅ Real Duffel API data loaded!',
    });

  } catch (error: any) {
    console.error('Duffel API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Check your DUFFEL_ACCESS_TOKEN in Vercel env (must be sandbox duffel_test_...)',
      tip: 'Test mode works without real money',
    }, { status: 500 });
  }
}
