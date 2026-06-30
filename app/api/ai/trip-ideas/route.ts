import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant for Ai-Assists that ONLY provides activity and experience suggestions for travel destinations.

Your ONLY job is to suggest things to do in a given destination.

You can ONLY answer questions about:
- Activities, experiences, attractions, food, and places to visit in a destination
- Local recommendations and hidden gems

Strict Rules:
- You must ONLY give travel/activity suggestions for the destination the user asked about.
- If the user asks about anything else (recipes, general knowledge, flights, hotels, bookings, other topics, etc.), reply with: "I'm only able to suggest activities and experiences for travel destinations."
- Never give advice outside of destination activities and experiences.
- Always give 6-8 specific suggestions.
- Mix popular activities with some lesser-known or unique ideas.
- Keep each suggestion short (1-2 sentences max).
- Be helpful, exciting, and realistic.
- Do not suggest flights, hotels, or booking-related services unless specifically asked.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Suggest things to do in: ${destination}` }
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate ideas right now.";

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Trip ideas error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
