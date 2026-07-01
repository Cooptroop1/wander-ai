// app/api/duffel/book/route.ts
// Full booking route for wander-ai
// Uses: Stripe (customer pays you) + Duffel Balance (you pay Duffel)
// Safer hold-then-pay flow recommended for real money

import { NextRequest, NextResponse } from 'next/server';
import { DuffelService } from '@/lib/duffel'; // ← Change this path if your lib folder is elsewhere

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // === REQUIRED FIELDS FROM FRONTEND ===
    const {
      offerId,
      passengers,           // Array of passenger objects (must match Duffel format)
      services = [],        // Optional: [{ id: "...", quantity: 1 }, ...] for seats/bags
      amount,               // Amount to pay Duffel (usually the base fare from the offer)
      currency,             // e.g. "GBP"
      // Optional but recommended:
      // paymentIntentId,   // Stripe PaymentIntent ID - verify this succeeded before booking
      // userId,            // Your user ID
      // tripId,            // If you already created a trip record
    } = body;

    // Basic validation
    if (!offerId || !passengers || !amount || !currency) {
      return NextResponse.json(
        { error: "Missing required fields: offerId, passengers, amount, currency" },
        { status: 400 }
      );
    }

    // =====================================================
    // TODO: Add your checks here before creating the booking
    // 1. Verify the Stripe PaymentIntent succeeded (highly recommended)
    // 2. Check user is authenticated
    // 3. (Optional) Check you have enough balance in Duffel
    // =====================================================

    const duffel = new DuffelService(process.env.DUFFEL_TOKEN!);

    // STEP 1: Create a HOLD order (no money taken from your Duffel balance yet)
    console.log("Creating hold order for offer:", offerId);
    const holdOrder = await duffel.createHoldOrder({
      offerId,
      passengers,
      services,
    });

    console.log("Hold order created:", holdOrder.id);

    // STEP 2: Pay the hold order using your Duffel Balance
    // This moves the money from your Duffel balance to the airline
    console.log("Paying hold order...");
    const paidOrder = await duffel.payForHoldOrder(
      holdOrder.id,
      amount,
      currency
    );

    console.log("Order successfully paid and booked:", paidOrder.id);

    // =====================================================
    // STEP 3: Save to your database (Supabase)
    // TODO: Add your Supabase insert here
    // Example:
    // const { data, error } = await supabase.from('bookings').insert({
    //   user_id: userId,
    //   trip_id: tripId,
    //   duffel_order_id: paidOrder.id,
    //   booking_reference: paidOrder.booking_reference,
    //   status: paidOrder.status,
    //   total_amount: paidOrder.total_amount,
    //   currency: paidOrder.total_currency,
    //   created_at: new Date().toISOString(),
    // });
    // =====================================================

    // Return success + order details to frontend
    return NextResponse.json({
      success: true,
      order: {
        id: paidOrder.id,
        booking_reference: paidOrder.booking_reference,
        status: paidOrder.status,
        total_amount: paidOrder.total_amount,
        currency: paidOrder.total_currency,
        created_at: paidOrder.created_at,
        // Add any other fields you want to show the user
      },
    });

  } catch (error: any) {
    console.error("Booking error:", error);

    // Return clean error to frontend
    return NextResponse.json(
      {
        error: error.message || "Failed to create booking",
        details: error.errors || null,
      },
      { status: 500 }
    );
  }
}
