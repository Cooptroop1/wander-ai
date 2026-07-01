// lib/duffel.ts
// Full Duffel service for ai-assists.com - Focused ONLY on "Create Offer → Create & Pay for Order"
// Copy-paste ready - no shortcuts - includes everything we successfully tested

import { Duffel } from '@duffel/api';

export interface PassengerInput {
  type: 'adult' | 'child' | 'infant';
  given_name?: string;
  family_name?: string;
  email?: string;
  phone_number?: string;
  born_on?: string;
  title?: string;
  gender?: 'm' | 'f';
  infant_passenger_id?: string; // for linking infant to adult
}

export interface ServiceInput {
  id: string;
  quantity: number;
}

export class DuffelService {
  private duffel: Duffel;

  constructor(token: string) {
    this.duffel = new Duffel({
      token, // Use your duffel_live_... token when going real
      // base_url can be overridden if needed, default is production
    });
  }

  // 1. Search flights and get offers
  async searchFlights(params: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers: PassengerInput[];
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
}) {
  const slices: any[] = [
    {
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departure_date,
    },
  ];

  if (params.return_date) {
    slices.push({
      origin: params.destination,
      destination: params.origin,
      departure_date: params.return_date,
    });
  }

  // Convert our flexible passengers into what Duffel offerRequests.create expects
  const offerPassengers = params.passengers.map(p => {
    if (p.type === 'adult') {
      return { type: 'adult' as const };
    } else if (p.age) {
      return { age: p.age };
    } else {
      return { type: 'adult' as const };
    }
  });

  const offerRequest = await this.duffel.offerRequests.create({
    slices,
    passengers: offerPassengers,
    cabin_class: params.cabin_class,
  });

  return offerRequest.data;
}

  // 2. Create and pay for a normal (paid immediately) order
  async createAndPayOrder(params: {
    offerId: string;
    passengers: any[];                    // full passenger objects with ids from offer request
    services?: ServiceInput[];            // seats + bags
    paymentType?: 'balance';              // we use balance as tested
    currency: string;
    totalAmount: string;                  // must include services cost!
  }) {
    const orderResponse = await this.duffel.orders.create({
      selected_offers: [params.offerId],
      payments: [
        {
          type: params.paymentType || 'balance',
          currency: params.currency,
          amount: params.totalAmount,
        },
      ],
      passengers: params.passengers,
      services: params.services || [],
    });

    return orderResponse.data;
  }

  // 3. Create Hold order (pay later)
  async createHoldOrder(params: {
    offerId: string;
    passengers: any[];
    services?: ServiceInput[];
  }) {
    const orderResponse = await this.duffel.orders.create({
      selected_offers: [params.offerId],
      type: 'hold',
      passengers: params.passengers,
      services: params.services || [],
    });

    return orderResponse.data;
  }

  // 4. Pay for a held order
  async payForHoldOrder(orderId: string, amount: string, currency: string) {
    const paymentResponse = await this.duffel.orders.pay({
      order_id: orderId,
      payment: {
        type: 'balance',
        amount,
        currency,
      },
    });

    return paymentResponse.data;
  }

  // 5. Get full order details (very useful)
  async getOrder(orderId: string) {
    const orderResponse = await this.duffel.orders.get(orderId);
    return orderResponse.data;
  }

  // Helper to calculate total when adding services
  calculateTotal(baseAmount: string, services: ServiceInput[], servicePrices: Record<string, number>) {
    let extra = 0;
    services.forEach(s => {
      extra += (servicePrices[s.id] || 0) * s.quantity;
    });
    return (parseFloat(baseAmount) + extra).toFixed(2);
  }
}

// === How to use in ai-assists.com ===
// 1. Add to your .env: DUFFEL_TOKEN=duffel_live_xxxxxxxx
// 2. In a server action or API route:
// const duffel = new DuffelService(process.env.DUFFEL_TOKEN!);
// const offerReq = await duffel.searchFlights({...});
// const order = await duffel.createAndPayOrder({...});   // ← the full "make and pay" you asked for
