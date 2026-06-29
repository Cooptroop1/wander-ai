import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const systemPrompt = `You are a helpful travel AI assistant for Ai-Assists.
You give creative, practical, and inspiring suggestions for things to do in a destination.

Rules:
- Give 6-8 specific activity/experience suggestions.
- Mix popular things with some lesser-known or unique ideas.
- Keep each suggestion short (1-2 sentences max).
- Focus on activities, experiences, food, and places to visit.
- Do not suggest flights or accommodation unless asked.
- Be helpful and exciting but realistic.`;

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
