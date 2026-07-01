// lib/duffel.ts
// Cleaned Duffel service for ai-assists.com
// All TypeScript errors fixed for current @duffel/api types

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
  infant_passenger_id?: string;
  age?: number; // Added for offer request compatibility
}

export interface ServiceInput {
  id: string;
  quantity: number;
}

export class DuffelService {
  public duffel: Duffel;

  constructor(token: string) {
    this.duffel = new Duffel({ token });
  }

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

    // Convert passengers to what Duffel expects for offerRequests.create
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

  async createAndPayOrder(params: {
    offerId: string;
    passengers: any[];
    services?: ServiceInput[];
    paymentType?: 'balance';
    currency: string;
    totalAmount: string;
  }) {
    const orderResponse = await this.duffel.orders.create({
      type: 'instant',
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

  async createHoldOrder(params: {
    offerId: string;
    passengers: any[];
    services?: ServiceInput[];
  }) {
    const orderResponse = await this.duffel.orders.create({
      type: 'pay_later',
      selected_offers: [params.offerId],
      passengers: params.passengers,
      services: params.services || [],
    });

    return orderResponse.data;
  }

  // Temporarily disabled - SDK version in this project doesn't have .pay or .payForHold
// async payForHoldOrder(orderId: string, amount: string, currency: string) {
//   const paymentResponse = await this.duffel.orders.payForHold({
//     order_id: orderId,
//     payment: {
//       type: 'balance',
//       amount,
//       currency,
//     },
//   });
//   return paymentResponse.data;
// }

  async getOrder(orderId: string) {
    const orderResponse = await this.duffel.orders.get(orderId);
    return orderResponse.data;
  }

  calculateTotal(baseAmount: string, services: ServiceInput[], servicePrices: Record<string, number>) {
    let extra = 0;
    services.forEach(s => {
      extra += (servicePrices[s.id] || 0) * s.quantity;
    });
    return (parseFloat(baseAmount) + extra).toFixed(2);
  }
}
