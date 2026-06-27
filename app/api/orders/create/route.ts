import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY;
const DUFFEL_API_URL = 'https://api.duffel.com';

export async function POST(request: NextRequest) {
  if (!DUFFEL_ACCESS_TOKEN) {
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
        { success: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Duffel requires { data: payload }
    const response = await fetch(`${DUFFEL_API_URL}/air/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({ data: payload }),
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
