// app/api/bookings/create/route.ts
import { Duffel } from '@duffel/api';
import { NextRequest } from 'next/server';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, passengers, totalAmount, totalCurrency } = body;

    if (!offerId) {
      return Response.json({ success: false, error: "offerId is missing — please select a flight" }, { status: 400 });
    }

    const order = await duffel.orders.create({
      type: "instant",
      selected_offers: [offerId],
      payments: [{
        type: "balance",
        currency: totalCurrency || "GBP",
        amount: totalAmount || "32.24",
      }],
      passengers: Array.isArray(passengers) ? passengers : [{
        title: "mr",
        given_name: passengers?.given_name || passengers?.firstName || "Alex",
        family_name: passengers?.family_name || passengers?.lastName || "Cooper",
        born_on: passengers?.born_on || "1995-01-01",
        gender: "m",
        email: passengers?.email || "test@example.com",
        phone_number: passengers?.phone_number || "+442080160508",
      }],
    });

    console.log("✅ Duffel order created successfully:", order.data.id);

    return Response.json({
      success: true,
      order: order.data,
      message: "Booking confirmed! 🎉",
    });

  } catch (error: any) {
    console.error("Full Duffel error:", error?.body || error);
    return Response.json({
      success: false,
      error: error?.body?.errors?.[0]?.title || error?.message || "Failed to create booking",
      details: error?.body || null,
    }, { status: 400 });
  }
}
