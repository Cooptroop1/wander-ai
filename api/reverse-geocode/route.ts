import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WanderAI/1.0[](https://wander-ai.vercel.app)',
        },
      }
    );

    const data = await res.json();

    const placeName =
      data.display_name ||
      `${data.address?.city || data.address?.town || data.address?.village || 'Unknown'}, ${data.address?.country || ''}`;

    return NextResponse.json({ placeName, address: data.address });
  } catch (error) {
    return NextResponse.json({ placeName: 'Unknown location' });
  }
}
