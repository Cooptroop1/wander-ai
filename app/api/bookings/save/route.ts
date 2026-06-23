// app/api/bookings/save/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, pnr, route, date, amount, passenger_name } = body;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        order_id,
        pnr,
        route,
        date,
        amount,
        passenger_name: passenger_name || "Alex Cooper",
        status: "Confirmed"
      })
      .select();

    if (error) throw error;

    console.log("✅ Saved to Supabase:", data);

    return Response.json({ success: true, data });

  } catch (error: any) {
    console.error("Supabase save error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
