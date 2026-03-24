import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';   // ← this bypasses Supabase auth

export async function POST(request: NextRequest) {
  try {
    const { placeName, homeCity, lat, lng } = await request.json();

    const prompt = `You are a helpful travel planner. Create a nice 3-4 day itinerary for ${placeName} (coordinates: ${lat}, ${lng}). User is flying from ${homeCity || 'their home city'}.

Return **ONLY** valid JSON like this:
{
  "summary": "short exciting one-liner",
  "flights": "realistic price range from their city",
  "hotels": ["Hotel 1 – $price/night", "Hotel 2 – $price/night"],
  "weather": "weather summary",
  "itinerary": [
    { "day": 1, "title": "Day title", "desc": "short description" },
    { "day": 2, "title": "Day title", "desc": "short description" }
  ]
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Grok error ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const itinerary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: "Grok returned something weird" };

    return NextResponse.json(itinerary);

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
