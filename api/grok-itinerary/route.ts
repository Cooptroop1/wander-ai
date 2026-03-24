import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { placeName, homeCity, lat, lng } = await request.json();

  const prompt = `You are a friendly travel expert. Create a beautiful 3-4 day trip itinerary for ${placeName} (lat ${lat}, lng ${lng}).

User is flying from: ${homeCity || 'their home city'}.

Make it exciting, realistic, and personal. Include:
- Flight price estimate from their home city
- 2 hotel suggestions with rough prices
- Weather summary
- Day-by-day plan (short & fun)

Return ONLY valid JSON in this exact format:
{
  "summary": "short exciting one-liner",
  "flights": "realistic price range and details",
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
      max_tokens: 1200,
    }),
  });

  const data = await response.json();
  const itineraryText = data.choices[0].message.content;

  // Extract the JSON from Grok's reply
  const jsonMatch = itineraryText.match(/\{[\s\S]*\}/);
  const itinerary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: "Something went wrong", flights: "", hotels: [], weather: "", itinerary: [] };

  return NextResponse.json(itinerary);
}
