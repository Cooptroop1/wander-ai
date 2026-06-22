import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { placeName, homeCity, lat, lng, departureDate, returnDate } = await request.json();

        const prompt = `Create a rich, fun day-by-day itinerary for a trip to ${placeName}.

User is flying from: ${homeCity || 'their home city'} 
Selected flight: ${selectedFlights ? selectedFlights.total_amount + selectedFlights.total_currency + ' with ' + (selectedFlights.slices?.[0]?.segments?.[0]?.operating_carrier?.name || 'airline') : 'budget flight'}
Departure: ${departureDate || 'soon'}, Return: ${returnDate || 'a few days later'}.

IMPORTANT:
- Make it 4-7 days long matching the exact dates.
- Include realistic local activities near ${placeName} (food, sights, markets, parks, walks, evening plans).
- Day 1 = arrival + easy activities.
- Make it practical and exciting for a normal traveller.

Return ONLY valid JSON like this:
{
  "summary": "short exciting one-liner",
  "flights": "the real selected flight details",
  "hotels": ["Hotel 1 – $price/night", "Hotel 2 – $price/night"],
  "weather": "weather summary",
  "itinerary": [
    { "day": 1, "title": "Arrival day", "desc": "detailed paragraph with activities" },
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
