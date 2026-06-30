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

    // Check monthly limit for AI Booking Helper (100 messages)
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
    const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that ONLY helps users with their existing flight bookings. 

You can only answer questions about:
- Cancelling or changing flights
- Adding/removing bags
- Seat selection
- Special requests (meals, assistance, etc.)
- Checking booking status or rules
- Name changes or passenger issues

Rules:
- You must ONLY answer questions related to the user's booking.
- If the user asks about anything else, politely say: "I'm only able to help with managing this specific booking."
- Be concise and helpful.
- Booking reference: ${bookingContext?.booking_reference || 'unknown'}.`,
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

    const grokData = await grokRes.json();
    const responseText = grokData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

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

    return NextResponse.json({ response: responseText });

  } catch (error: any) {
    console.error('Manage booking AI error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
