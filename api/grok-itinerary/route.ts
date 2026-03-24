import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { placeName, homeCity, lat, lng } = await request.json();

    console.log('🔑 GROK_API_KEY exists?', !!process.env.GROK_API_KEY);

    const prompt = `Create a short 3-day trip itinerary for ${placeName}. User flying from ${homeCity || 'their city'}. Return ONLY valid JSON.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Grok API error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const itinerary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: "No JSON found" };

    return NextResponse.json(itinerary);

  } catch (err: any) {
    console.error('Grok route error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
