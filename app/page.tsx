'use client';

import React, { useState } from 'react';
import { DuffelAncillaries } from '@duffel/components';

export default function WanderAI() {
  // === STATE ===
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [departureDate, setDepartureDate] = useState('2026-07-15');
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [ancillariesPayload, setAncillariesPayload] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Passenger form state (blank)
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bornOn, setBornOn] = useState('');
  const [gender, setGender] = useState<'m' | 'f'>('m');
  const [title, setTitle] = useState<'mr' | 'mrs' | 'ms' | 'miss' | 'dr'>('mr');

  // === SEARCH FLIGHTS ===
  const searchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: departureDate,
        }),
      });
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (err) {
      console.error(err);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // === CLEAN HANDLE PAY NOW (uses DuffelAncillaries payload) ===
  const handlePayNow = async () => {
    if (!selectedOffer) {
      alert('No offer selected');
      return;
    }
    if (!ancillariesPayload) {
      alert('Please add bags or seats using the form above first.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        ...ancillariesPayload.data,
        type: 'instant',
        selected_offers: [selectedOffer.id],
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: orderPayload }),
      });

      const result = await res.json();

      if (!result.success) {
        alert('Booking failed: ' + (result.error || 'Unknown error'));
        return;
      }

      alert(`✅ Booked! Order ID: ${result.order.id}`);
      setShowCheckout(false);
      setAncillariesPayload(null);
      setSelectedOffer(null);

    } catch (err: any) {
      console.error(err);
      alert('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  // === SELECT OFFER AND OPEN CHECKOUT ===
  const selectOffer = (offer: any) => {
    setSelectedOffer(offer);
    setShowCheckout(true);
    setAncillariesPayload(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wander AI</h1>

        {/* Search Form */}
        <div className="bg-zinc-900 p-6 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="bg-zinc-800 p-3 rounded" placeholder="Origin" />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-zinc-800 p-3 rounded" placeholder="Destination" />
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="bg-zinc-800 p-3 rounded" />
            <button onClick={searchFlights} disabled={loading} className="bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold">
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </div>
        </div>

        {/* Results */}
        {offers.length > 0 && (
          <div className="space-y-4 mb-8">
            {offers.map((offer, index) => (
              <div key={index} onClick={() => selectOffer(offer)} className="bg-zinc-900 p-6 rounded-2xl cursor-pointer hover:bg-zinc-800">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{offer.owner?.name}</div>
                    <div className="text-sm text-zinc-400">{offer.slices?.[0]?.segments?.[0]?.departing_at}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">£{offer.total_amount}</div>
                    <div className="text-xs text-zinc-400">{offer.total_currency}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHECKOUT MODAL */}
        {showCheckout && selectedOffer && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-auto p-8">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Complete your booking</h2>
                <button onClick={() => setShowCheckout(false)} className="text-zinc-400">✕</button>
              </div>

              {/* Flight Summary */}
              <div className="bg-zinc-800 p-4 rounded-xl mb-6">
                <div className="font-semibold">{selectedOffer.owner?.name}</div>
                <div className="text-sm text-zinc-400">
                  {selectedOffer.slices?.[0]?.origin} → {selectedOffer.slices?.[0]?.destination}
                </div>
                <div className="text-xl font-bold mt-2">£{selectedOffer.total_amount}</div>
              </div>

              {/* DUFFEL ANCILLARIES - CLEAN */}
              <div className="mb-8">
                <div className="font-semibold mb-3 text-lg">Bags, seats & extras</div>
                <div className="bg-zinc-800 rounded-2xl p-6">
                  <DuffelAncillaries
                    offer={selectedOffer}
                    services={["bags", "seats"]}
                    seat_maps={[]}
                    passengers={[
  {
    id: "pax_1",
    given_name: givenName || "",
    family_name: familyName || "",
    born_on: bornOn || "",
    title: title || "mr",
    gender: gender,
    email: email || "",
    phone_number: phone || "",
  },
]}
                    onPayloadReady={(payload) => {
                      setAncillariesPayload(payload);
                    }}
                  />
                </div>
              </div>

              {/* Simple Passenger Form (blank) */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <input placeholder="First name" value={givenName} onChange={e => setGivenName(e.target.value)} className="bg-zinc-800 p-3 rounded" />
                <input placeholder="Last name" value={familyName} onChange={e => setFamilyName(e.target.value)} className="bg-zinc-800 p-3 rounded" />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-zinc-800 p-3 rounded col-span-2" />
                <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="bg-zinc-800 p-3 rounded col-span-2" />
                <input type="date" value={bornOn} onChange={e => setBornOn(e.target.value)} className="bg-zinc-800 p-3 rounded" />
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={loading || !ancillariesPayload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 p-4 rounded-2xl font-bold text-lg"
              >
                {loading ? 'Processing...' : 'Pay Now & Book'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-zinc-500 mt-12">
          Clean build • Duffel Ancililaries integrated
        </p>
      </div>
    </div>
  );
}
