import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, bookingContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `You are a helpful AI assistant for Ai-Assists, a flight booking platform.
You help users manage their existing bookings (changes, cancellations, adding bags, name corrections, etc.).

Important rules:
- Be helpful and clear.
- Always remind the user that final changes/cancellations must be done with the airline.
- Use the booking context provided if relevant.
- Keep answers concise and actionable.
- If you don't know something, say so honestly.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3', // or 'grok-2' depending on what you have access to
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Booking context: ${JSON.stringify(bookingContext)}\n\nUser question: ${message}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Grok API error:', errorData);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ response: aiMessage });

  } catch (error) {
    console.error('Manage booking AI error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
