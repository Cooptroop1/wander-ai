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
    const { order_id, pnr, route, date, amount } = body;

    const { data, error } = await supabase
      .from('bookings')
      .insert({ order_id, pnr, route, date, amount, user_id: "user1" }) // add user_id later
      .select();

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
