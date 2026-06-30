import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabase = createRouteHandlerClient({ cookies });

export async function POST(request: NextRequest) {
  try {
    const { message, bookingContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get logged in user properly
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is Pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    if (!profile?.is_pro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // Check monthly limit (100 messages)
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: usage } = await supabase
      .from('feature_usage')
      .select('id, count')
      .eq('user_id', user.id)
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

    // Increment usage
    if (usage) {
      await supabase
        .from('feature_usage')
        .update({ count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('id', usage.id);
    } else {
      await supabase.from('feature_usage').insert({
        user_id: user.id,
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
