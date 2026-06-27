import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;
const DUFFEL_API_URL = 'https://api.duffel.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get('offer_id');

  if (!offerId) {
    return NextResponse.json(
      { success: false, error: 'Missing offer_id parameter' },
      { status: 400 }
    );
  }

  if (!DUFFEL_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Duffel API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${DUFFEL_API_URL}/air/seat_maps?offer_id=${offerId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DUFFEL_API_KEY}`,
          'Accept': 'application/json',
          'Duffel-Version': 'v2',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.errors?.[0]?.title || 'Failed to fetch seat maps' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      seat_maps: data.data || [],
    });

  } catch (error: any) {
    console.error('Seat maps fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
