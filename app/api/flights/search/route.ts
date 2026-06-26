import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, departDate, returnDate, passengers = 1, cabinClass = 'economy' } = body;

    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;
    if (!duffelToken) {
      return NextResponse.json({ success: false, error: "Duffel token not set" }, { status: 500 });
    }

    const res = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelToken}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slices: [
          {
            origin: from,
            destination: to,
            departure_date: departDate,
          },
          ...(returnDate ? [{
            origin: to,
            destination: from,
            departure_date: returnDate,
          }] : []),
        ],
        passengers: Array.from({ length: passengers }, () => ({ type: "adult" })),
        cabin_class: cabinClass,
        return_available_services: true,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      offers: data.data?.offers || [],
      raw: data,
      message: '✅ Real Duffel offers loaded!',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error in search',
    }, { status: 500 });
  }
}
