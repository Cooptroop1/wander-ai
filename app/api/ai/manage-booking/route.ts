import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { message, bookingContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get logged in user
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

    // === NEW: Check monthly limit for AI Booking Helper (100 messages) ===
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: usage } = await supabase
      .from('feature_usage')
      .select('count')
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
            content: `You are a helpful flight booking assistant. Booking reference: ${bookingContext?.booking_reference || 'unknown'}.`,
          },
          { role: 'user', content: message },
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
