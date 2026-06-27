import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY;
const DUFFEL_API_URL = 'https://api.duffel.com';

export async function POST(request: NextRequest) {
  if (!DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json({ success: false, error: 'Duffel key missing' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { payload } = body;

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
      return NextResponse.json(
        { success: false, error: data.errors?.[0]?.title || 'Duffel error', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, order: data.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
