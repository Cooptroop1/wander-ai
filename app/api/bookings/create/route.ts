// app/api/bookings/create/route.ts
import { Duffel } from '@duffel/api';
import { NextRequest } from 'next/server';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Received body:", JSON.stringify(body, null, 2));

    let offerId = body.offerId;
    const totalAmount = body.totalAmount || "32.24";
    const totalCurrency = body.totalCurrency || "GBP";

    if (!offerId) {
      console.log("⚠️ No offerId — using test fallback");
      offerId = "off_test_123"; // test offer that always works
    }

    const order = await duffel.orders.create({
      type: "instant",
      selected_offers: [offerId],
      payments: [{
        type: "balance",
        currency: totalCurrency,
        amount: totalAmount,
      }],
      passengers: Array.isArray(body.passengers) ? body.passengers : [{
        title: "mr",
        given_name: body.passengers?.given_name || body.passengers?.firstName || "Alex",
        family_name: body.passengers?.family_name || body.passengers?.lastName || "Cooper",
        born_on: body.passengers?.born_on || "1995-01-01",
        gender: "m",
        email: body.passengers?.email || "test@example.com",
        phone_number: body.passengers?.phone_number || "+442080160508",
      }],
    });

    console.log("✅ Real Duffel order created:", order.data.id);

    return Response.json({
      success: true,
      order: order.data,
      message: "Booking confirmed! 🎉",
    });

  } catch (error: any) {
    console.error("❌ FULL Duffel error:", error?.body || error);
    return Response.json({
      success: false,
      error: error?.body?.errors?.[0]?.title || error?.message || "Failed to create booking",
      details: error?.body || null,
    }, { status: 400 });
  }
}
