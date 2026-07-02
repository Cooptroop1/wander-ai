// app/api/duffel/book/route.ts
// Hold + Pay version that creates real passenger IDs internally

import { NextRequest, NextResponse } from 'next/server';
import { DuffelService } from '@/lib/duffel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency } = body;

    if (!amount || !currency) {
      return NextResponse.json({ error: 'Missing amount or currency' }, { status: 400 });
    }

    const duffel = new DuffelService(process.env.DUFFEL_ACCESS_TOKEN!);

    // Step 1: Create a small offer request to get valid passenger IDs
    const slices: any[] = [
      {
        origin: 'LHR',
        destination: 'JFK',
        departure_date: '2026-08-15',
      },
    ];

    const offerRequestResponse = await duffel.duffel.offerRequests.create({
      slices,
      passengers: [
        { type: 'adult' },
        { type: 'adult' },
      ],
      cabin_class: 'economy',
    });

    const offerRequest = offerRequestResponse.data;
    const offer = offerRequest.offers[0];

    // Step 2: Build passengers using the real IDs from this offer request
    const passengers = [
      {
        id: offerRequest.passengers[0].id,
        phone_number: '+442080160508',
        email: 'tony@example.com',
        born_on: '1980-07-24',
        title: 'mr',
        gender: 'm',
        family_name: 'Stark',
        given_name: 'Tony',
      },
      {
        id: offerRequest.passengers[1].id,
        phone_number: '+442080160509',
        email: 'potts@example.com',
        born_on: '1983-11-02',
        title: 'mrs',
        gender: 'f',
        family_name: 'Potts',
        given_name: 'Pepper',
      },
    ];

    // Step 3: Create HOLD order using the offer we just got
    const holdOrder = await duffel.createHoldOrder({
      offerId: offer.id,
      passengers,
      services: [],
    });

    // Step 4: Pay the hold order
    const paidOrder = await duffel.payForHoldOrder(
      holdOrder.id,
      offer.total_amount,
      offer.total_currency
    );

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
