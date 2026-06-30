import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { message, bookingContext, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Check if user is Pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();

    if (!profile?.is_pro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // Check monthly limit (100 messages)
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: usage } = await supabase
      .from('feature_usage')
      .select('id, count')
      .eq('user_id', userId)
      .eq('feature', 'booking_helper')
      .eq('month', currentMonth)
      .single();

    const currentCount = usage?.count || 0;

    if (currentCount >= 100) {
      return NextResponse.json({ 
        error: 'You have reached your monthly limit of 100 AI Booking Helper messages.' 
      }, { status: 429 });
    }

    // Call Grok
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          {
            role: 'system',
            content: `You are a friendly and helpful AI assistant for Ai-Assists that specialises in helping users manage their existing flight bookings.

Your goal is to guide the user step-by-step and make the process as easy as possible.

You can help with:
- Cancelling a flight
- Changing dates or flights
- Adding or removing bags
- Seat selection or changes
- Name corrections
- Special requests (meals, assistance, etc.)
- Explaining airline policies for their booking

Rules:
- Always be helpful and guide the user clearly.
- Use the booking reference when relevant: ${bookingContext?.booking_reference || 'unknown'}.
- If the user asks about anything completely unrelated to their booking (recipes, general holidays, other unrelated topics), politely say: "I'm only able to help with managing this specific booking."
- Be clear, friendly, and practical. Offer next steps where possible.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Increment usage count
    if (usage) {
      await supabase
        .from('feature_usage')
        .update({ count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('id', usage.id);
    } else {
      await supabase.from('feature_usage').insert({
        user_id: userId,
        feature: 'booking_helper',
        count: 1,
        month: currentMonth,
      });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Manage booking AI error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
