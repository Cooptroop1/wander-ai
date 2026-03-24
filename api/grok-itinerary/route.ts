import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';   // ← this fixes the 405 auth issue

export async function POST(request: NextRequest) {
  try {
    const { placeName, homeCity, lat, lng } = await request.json();

    console.log('🔑 GROK_API_KEY exists?', !!process.env.GROK_API_KEY);
    console.log('📍 Request for:', placeName, homeCity);

    const prompt = `Create a short 3-4 day trip itinerary for ${placeName}. User is flying from ${homeCity || 'their home city'}. Return ONLY valid JSON in this exact format:
{
  "summary": "short exciting one-liner",
  "flights": "realistic price range",
  "hotels": ["hotel 1 – $price", "hotel 2 – $price"],
  "weather": "weather summary",
  "itinerary": [
    { "day": 1, "title": "...", "desc": "..." },
    { "day": 2, "title": "...", "desc": "..." }
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
      console.error('❌ Grok error:', response.status, errorText);
      return NextResponse.json({ error: `Grok API error ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const itinerary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: "No JSON returned" };

    return NextResponse.json(itinerary);

  } catch (err: any) {
    console.error('🚨 Full error in route:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
