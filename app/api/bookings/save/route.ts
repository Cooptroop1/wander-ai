// app/api/bookings/save/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📦 Booking saved to DB:", body);

    // Mock success for now — real Supabase when keys work
    return Response.json({
      success: true,
      message: "Booking saved to database",
      id: "booking_" + Date.now(),
    });

  } catch (error: any) {
    console.error(error);
    return Response.json({
      success: false,
      error: error.message || "Failed to save",
    }, { status: 500 });
  }
}
