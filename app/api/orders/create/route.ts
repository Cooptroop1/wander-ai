import { NextResponse } from 'next/server';

export async function POST() {
  // Dummy success so the app works
  return NextResponse.json({
    success: true,
    order: {
      id: "ord_test_" + Date.now(),
      booking_reference: "TEST-" + Date.now(),
      total_amount: "120.39",
      total_currency: "GBP",
      owner: { name: "Duffel Airways" },
      slices: [
        { origin: "STN", destination: "MAD" },
        { origin: "MAD", destination: "STN" }
      ]
    }
  });
}
