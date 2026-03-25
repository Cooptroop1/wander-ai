import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { placeName, homeCity, lat, lng, departureDate, returnDate } = await request.json();

    const prompt = `You are a travel expert. Create a realistic itinerary for ${placeName}.

User is flying from: ${homeCity || 'their home city'}
Departure date: ${departureDate || 'any date'}
Return date: ${returnDate || 'any date'}

IMPORTANT: Calculate the EXACT number of nights = (return date - departure date). 
Do NOT default to 4 days. Use the real dates above and make the trip length match exactly.

Return ONLY valid JSON in this exact format:
{
  "summary": "short exciting one-liner",
  "flights": "realistic price range",
  "hotels": ["Hotel 1 – $price/night", "Hotel 2 – $price/night"],
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
        temperature: 0.7,
        max_tokens: 1200,
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
