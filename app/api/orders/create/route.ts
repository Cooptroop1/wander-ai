import { duffel } from "@/lib/duffel"; // Make sure this path matches your project

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let orderPayload: any;

    // If the frontend sent a full payload from DuffelAncilaries component, use it
    if (body.payload) {
      orderPayload = body.payload;
    } 
    // Fallback for old/manual flow or simple Pay Now / Hold
    else {
      orderPayload = {
        type: body.type || "instant",
        selected_offers: [body.offerId],
        passengers: body.passengers || [],
      };

      // Only add payments for instant orders
      if (orderPayload.type === "instant") {
        orderPayload.payments = body.payments || [
          {
            type: "balance",
            currency: "GBP",
            amount: body.finalAmount || body.payload?.total_amount,
          },
        ];
      }

      // Optional: add services if sent manually
      if (body.services && body.services.length > 0) {
        orderPayload.services = body.services;
      }
    }

    // Create the order with Duffel
    const orderResponse = await duffel.orders.create(orderPayload);

    return Response.json({
      success: true,
      order: orderResponse.data,
    });

  } catch (error: any) {
    console.error("=== ORDER CREATION ERROR ===");
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create order",
        details: error?.errors || error,
      },
      { status: 500 }
    );
  }
}
