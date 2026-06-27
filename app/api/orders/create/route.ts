import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;
const DUFFEL_API_URL = 'https://api.duffel.com';

export async function POST(request: NextRequest) {
  if (!DUFFEL_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Duffel API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload || !payload.selected_offers?.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload - missing selected_offers' },
        { status: 400 }
      );
    }

    const response = await fetch(`${DUFFEL_API_URL}/air/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Duffel order error:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.errors?.[0]?.title || 'Failed to create order',
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      order: data.data,
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
