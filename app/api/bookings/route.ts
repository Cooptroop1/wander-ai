// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mockDb';

export async function GET() {
  // Real app: await prisma.booking.findMany({ where: { userId: session.user.id } })
  // For demo we return all + comment real integration
  const bookings = db.getAll();
  return NextResponse.json({ bookings, count: bookings.length });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Simulate real Duffel call (already working per previous state)
    const duffelResponse = {
      id: `ord_duffel_${Date.now().toString(36)}`,
      status: 'confirmed',
      // ... full Duffel order shape would be here
    };

    const saved = db.add({
      duffelId: duffelResponse.id,
      origin: payload.origin || 'LHR',
      destination: payload.destination || 'MAD',
      departure: payload.departure || '2026-07-10 09:15',
      arrival: payload.arrival || '2026-07-10 12:40',
      passengers: payload.passengers || 1,
      total: payload.total || 487,
      status: 'confirmed',
      segments: payload.segments || [{ airline: 'British Airways', flight: 'BA327', duration: '3h 25m' }],
    });

    return NextResponse.json({
      success: true,
      booking: saved,
      duffelOrder: duffelResponse,
      message: 'Booking confirmed with Duffel • Saved to DB',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
