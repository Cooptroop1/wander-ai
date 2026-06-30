import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, departDate, returnDate, passengers = 1, cabinClass = 'economy' } = body;

    if (!from || !to || !departDate) {
      return NextResponse.json({ success: false, error: "Missing from, to or departDate" }, { status: 400 });
    }

    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;
    if (!duffelToken) {
      return NextResponse.json({ success: false, error: "Duffel token not set" }, { status: 500 });
    }

    const slices = [
      {
        origin: from.toUpperCase(),
        destination: to.toUpperCase(),
        departure_date: departDate,
      },
    ];

    if (returnDate) {
      slices.push({
        origin: to.toUpperCase(),
        destination: from.toUpperCase(),
        departure_date: returnDate,
      });
    }

    const duffelBody = {
      data: {
        slices,
        passengers: Array.from({ length: passengers }, () => ({ type: "adult" })),
        cabin_class: cabinClass,
        return_available_services: true,
        limit: 50,
      }
    };

    const res = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelToken}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duffelBody),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.errors?.[0]?.message || JSON.stringify(data) }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      offers: data.data?.offers || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
