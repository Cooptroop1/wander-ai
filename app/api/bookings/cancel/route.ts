// app/api/bookings/cancel/route.ts
import { Duffel } from '@duffel/api';
import { NextRequest } from 'next/server';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return Response.json({ success: false, error: "orderId required" }, { status: 400 });
    }

    // Step 1: Get cancellation quote
    const cancellationQuote = await duffel.orderCancellations.create({
      order_id: orderId,
    });

    const refundAmount = cancellationQuote.data.refund_amount || "0.00";

    // Step 2: Confirm cancellation (uncomment when you want to actually cancel)
    // const confirmed = await duffel.orderCancellations.confirm(cancellationQuote.data.id);

    return Response.json({
      success: true,
      quote: cancellationQuote.data,
      refundAmount,
      message: `Refund of £${refundAmount} will be processed if you confirm.`,
    });

  } catch (error: any) {
    console.error(error);
    return Response.json({ success: false, error: error.message || "Cancel failed" }, { status: 400 });
  }
}
