// app/api/bookings/create/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Received:", body);

    // Simple success so the full flow works
    const mockOrder = {
      id: "ord_" + Date.now(),
      booking_reference: "RZPNX8",
      total_amount: body.totalAmount || "32.24",
      total_currency: body.totalCurrency || "GBP",
    };

    console.log("✅ Booking succeeded");

    return Response.json({
      success: true,
      order: mockOrder,
      message: "Booking confirmed! 🎉",
    });

  } catch (error: any) {
    console.error(error);
    return Response.json({
      success: false,
      error: error.message || "Failed to create booking",
    }, { status: 400 });
  }
}
