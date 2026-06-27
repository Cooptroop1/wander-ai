import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let orderPayload: any;

    // Support payload from Duffel Ancillaries component
    if (body.payload) {
      orderPayload = body.payload;
    } 
    // Fallback for manual / old flow
    else {
      orderPayload = {
        type: body.type || "instant",
        selected_offers: [body.offerId],
        passengers: body.passengers || [],
      };

      if (orderPayload.type === "instant") {
        orderPayload.payments = body.payments || [
          {
            type: "balance",
            currency: "GBP",
            amount: body.finalAmount,
          },
        ];
      }

      if (body.services && body.services.length > 0) {
        orderPayload.services = body.services;
      }
    }

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
