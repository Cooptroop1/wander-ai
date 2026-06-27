import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY;

export async function POST(request: NextRequest) {
  if (!DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json({ success: false, error: 'Duffel key missing' }, { status: 500 });
  }

  try {
    const body = await request.json();

    // You can pass these from the frontend
    const {
      selected_offers = [],
      success_url = 'https://wander-ai-navy.vercel.app/success',
      failure_url = 'https://wander-ai-navy.vercel.app/',
      abandonment_url = 'https://wander-ai-navy.vercel.app/',
      checkout_display_text = 'Secure payment powered by Duffel',
      primary_color = '#1e40af',
      secondary_color = '#64748b',
    } = body;

    const response = await fetch('https://api.duffel.com/air/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({
        data: {
          brand: {
            primary_color,
            secondary_color,
          },
          success_url,
          failure_url,
          abandonment_url,
          checkout_display_text,
          selected_offers,           // Pass offer IDs here to pre-select flights
          traveler_currency: 'GBP',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.errors?.[0]?.message || 'Failed to create link', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      link_url: data.data.url,
      session_id: data.data.id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
