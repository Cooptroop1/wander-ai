import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ placeName: 'Unknown location' });
  }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      {
        headers: {
          'User-Agent': 'WanderAI/1.0',
        },
      }
    );

    const data = await res.json();

    // Build a nice readable place name
    const placeName = 
      data.locality || 
      data.city || 
      data.principalSubdivision || 
      data.countryName || 
      'Unknown location';

    return NextResponse.json({ placeName });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ placeName: 'Unknown location' });
  }
}
