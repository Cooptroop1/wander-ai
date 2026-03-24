import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ placeName: 'Unknown location' });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10&accept-language=en`,
      {
        headers: {
          'User-Agent': 'WanderAI/1.0[](https://wander-ai.vercel.app)',
          'Accept': 'application/json',
        },
      }
    );

    if (!res.ok) throw new Error('Nominatim failed');

    const data = await res.json();

    // Much better place name logic
    let placeName = data.display_name || '';

    if (!placeName) {
      const addr = data.address || {};
      const parts = [
        addr.city || addr.town || addr.village || addr.municipality,
        addr.county || addr.state || addr.region,
        addr.country
      ].filter(Boolean);
      placeName = parts.join(', ') || 'Unknown location';
    }

    return NextResponse.json({ placeName });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ placeName: 'Unknown location' });
  }
}
