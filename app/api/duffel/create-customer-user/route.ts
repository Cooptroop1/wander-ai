import { NextRequest, NextResponse } from 'next/server';

const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY;

export async function POST(request: NextRequest) {
  if (!DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json({ success: false, error: 'Duffel key missing' }, { status: 500 });
  }

  try {
    const { email, given_name, family_name, phone_number } = await request.json();

    const response = await fetch('https://api.duffel.com/identity/customer/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({
        data: {
          email,
          given_name,
          family_name,
          phone_number,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.errors?.[0]?.message || 'Failed to create customer user', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, customerUser: data.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
