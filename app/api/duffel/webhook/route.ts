import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // Use service role key here (not anon key)
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Duffel sends different event types
    if (body.type === 'booking.created' || body.type === 'booking.updated') {
      const booking = body.data;

      // Try to find the user by email (from passengers)
      const passengerEmail = booking.passengers?.[0]?.email;

      if (!passengerEmail) {
        console.log('No passenger email found in webhook');
        return NextResponse.json({ received: true });
      }

      // Find user in Supabase by email
      const { data: userData } = await supabase
        .from('profiles') // or your users table
        .select('id')
        .eq('email', passengerEmail)
        .single();

      if (!userData) {
        console.log('User not found for email:', passengerEmail);
        return NextResponse.json({ received: true });
      }

      // Save rich booking data
      await supabase.from('bookings').upsert({
        user_id: userData.id,
        booking_reference: booking.booking_reference,
        status: booking.status || 'confirmed',
        total_amount: booking.total_amount,
        total_currency: booking.total_currency,
        slices: booking.slices,           // ← Full flight data
        passengers: booking.passengers,
        raw_booking: booking,             // Keep full object for future use
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'booking_reference'
      });

      console.log('Booking saved from webhook:', booking.booking_reference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
