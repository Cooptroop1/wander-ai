import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const response = await fetch(
      `https://api.duffel.com/places/suggestions?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
          'Duffel-Version': 'v2',
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json({ places: data.data || [] });

  } catch (error) {
    console.error('Duffel suggestions error:', error);
    return NextResponse.json({ places: [], error: 'API issue' }, { status: 500 });
  }
}
