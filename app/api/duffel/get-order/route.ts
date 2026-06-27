import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY;

export async function GET(request: NextRequest) {
  if (!DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json({ success: false, error: 'Duffel key missing' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'Missing order_id' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.duffel.com/air/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.errors?.[0]?.message || 'Failed to fetch order' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, order: data.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
