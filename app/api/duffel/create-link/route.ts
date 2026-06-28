import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selected_offers } = body;

    if (!selected_offers || !Array.isArray(selected_offers) || selected_offers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No offers selected' },
        { status: 400 }
      );
    }

    // Get base URL (works for both localhost and production)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const duffelResponse = await fetch('https://api.duffel.com/air/payments/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          selected_offers: selected_offers,

          // Redirect URLs
          success_url: `${baseUrl}/booking/success`,
          failure_url: `${baseUrl}/booking/failed`,
          abandonment_url: `${baseUrl}/booking/abandoned`,

          // Nice checkout display text
          display: {
            title: "Complete your booking",
            description: "You're booking with Ai-Assists",
          },
        },
      }),
    });

    const result = await duffelResponse.json();

    if (!duffelResponse.ok) {
      console.error('Duffel error:', result);
      return NextResponse.json(
        { 
          success: false, 
          error: result.errors?.[0]?.message || 'Failed to create payment link' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      link_url: result.data.url,
      payment_link_id: result.data.id,
    });

  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
