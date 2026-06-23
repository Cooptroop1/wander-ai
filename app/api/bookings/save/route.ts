// app/api/bookings/save/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { order_id, pnr, route, date, amount } = body;

  const { data, error } = await supabase
    .from('bookings')
    .insert({ order_id, pnr, route, date, amount });

  if (error) return Response.json({ success: false, error: error.message });
  return Response.json({ success: true });
}
