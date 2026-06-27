'use client';

import React, { useState } from 'react';

export default function WanderAI() {
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [departureDate, setDepartureDate] = useState('2026-07-15');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const searchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: origin.toUpperCase(),
          to: destination.toUpperCase(),
          departDate: departureDate,
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

  const openBooking = (offer: any) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

    const bookFlight = async () => {
    if (!selectedOffer) return;

    setLoading(true);

    try {
      const orderPayload = {
        type: "instant",
        selected_offers: [selectedOffer.id],
        passengers: [
          {
            given_name: "Test",
            family_name: "Passenger",
            born_on: "1990-01-01",
            title: "mr",
            gender: "m",
            email: "test@example.com",
            phone_number: "+447700000000",
          },
        ],
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: orderPayload }),
      });

      const result = await res.json();

      if (!result.success) {
        console.error("Duffel error:", result);
        alert("Booking failed: " + (result.error || "Unknown error from Duffel"));
        return;
      }

      alert(`✅ Booked successfully!\nOrder ID: ${result.order.id}`);
      setShowModal(false);
      setSelectedOffer(null);

    } catch (err: any) {
      console.error(err);
      alert("Error creating booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wander AI</h1>

        {/* Search Form */}
        <div className="bg-zinc-900 p-6 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="bg-zinc-800 p-3 rounded-xl" placeholder="Origin (e.g. LHR)" />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-zinc-800 p-3 rounded-xl" placeholder="Destination (e.g. JFK)" />
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="bg-zinc-800 p-3 rounded-xl" />
            <button onClick={searchFlights} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 p-3 rounded-xl font-semibold">
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </div>
        </div>

        {/* Results */}
        {offers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Flights ({offers.length})</h2>
            <div className="space-y-4">
              {offers.map((offer, index) => {
                const slice = offer.slices?.[0];
                const segment = slice?.segments?.[0];
                const airline = offer.owner?.name || 'Airline';
                const originCode = typeof slice?.origin === 'string' ? slice.origin : slice?.origin?.iata_code || 'N/A';
                const destCode = typeof slice?.destination === 'string' ? slice.destination : slice?.destination?.iata_code || 'N/A';

                return (
                  <div key={index} onClick={() => openBooking(offer)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-2xl p-6 cursor-pointer transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">{airline}</div>
                        <div className="text-sm text-zinc-400 mt-1">{originCode} → {destCode}</div>
                        <div className="text-xs text-zinc-500 mt-1">{segment?.departing_at}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">£{offer.total_amount}</div>
                        <div className="text-xs text-zinc-400">{offer.total_currency}</div>
                        <div className="text-emerald-400 text-sm mt-1">Book this flight →</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Simple Booking Modal */}
        {showModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-md p-8">
              <h2 className="text-2xl font-bold mb-6">Confirm Booking</h2>

              <div className="bg-zinc-800 rounded-2xl p-5 mb-6">
                <div className="font-semibold">{selectedOffer.owner?.name}</div>
                <div className="text-sm text-zinc-400 mt-1">
                  {selectedOffer.slices?.[0]?.origin?.iata_code || selectedOffer.slices?.[0]?.origin} → {selectedOffer.slices?.[0]?.destination?.iata_code || selectedOffer.slices?.[0]?.destination}
                </div>
                <div className="text-3xl font-bold mt-3">£{selectedOffer.total_amount}</div>
              </div>

             <p className="text-sm text-zinc-400 mb-6">
                    This will create a test booking with basic passenger details.
            </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 p-4 rounded-2xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={bookFlight}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 p-4 rounded-2xl font-bold"
                >
                  {loading ? 'Booking...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-zinc-500 mt-12">
          Clean build • Basic one-way booking
        </p>
      </div>
    </div>
  );
}
