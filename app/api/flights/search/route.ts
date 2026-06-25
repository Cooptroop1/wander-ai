
import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from = 'LHR', to = 'JFK', departDate = '2026-07-15' } = body;

    const duffel = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN!,
    });

    const response = await duffel.offerRequests.create({
      slices: [{
        origin: from,
        destination: to,
        departure_date: departDate,
      } as any],
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy',
      return_offers: true,
    });

    const data = response as any;  // ← fixed for TS

    return NextResponse.json({
      success: true,
      offers: data.offers || data.data?.offers || [],
      raw: data,  // for debugging — you can see full response
      message: '✅ Real Duffel API data! (check console for full details)',
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      tip: 'Check DUFFEL_ACCESS_TOKEN is correct in Vercel and redeploy. Use sandbox token.',
    }, { status: 500 });
  }
}
