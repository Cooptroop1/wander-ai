// app/api/duffel/book/route.ts
// Temporary version using test passenger data so orders appear in Duffel

import { NextRequest, NextResponse } from 'next/server';
import { DuffelService } from '@/lib/duffel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, amount, currency } = body;

    if (!offerId || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const duffel = new DuffelService(process.env.DUFFEL_ACCESS_TOKEN!);

    // Using the same test passenger data that worked in your test script
    const testPassengers = [
      {
        id: 'pas_adult1', // temporary id
        phone_number: '+442080160508',
        email: 'tony@example.com',
        born_on: '1980-07-24',
        title: 'mr',
        gender: 'm',
        family_name: 'Stark',
        given_name: 'Tony',
      },
      {
        id: 'pas_adult2',
        phone_number: '+442080160509',
        email: 'potts@example.com',
        born_on: '1983-11-02',
        title: 'mrs',
        gender: 'f',
        family_name: 'Potts',
        given_name: 'Pepper',
      },
    ];

    const paidOrder = await duffel.createAndPayOrder({
      offerId,
      passengers: testPassengers,
      services: [],
      totalAmount: amount,
      currency,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: paidOrder.id,
        booking_reference: paidOrder.booking_reference,
        total_amount: paidOrder.total_amount,
        currency: paidOrder.total_currency,
      },
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
