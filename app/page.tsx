'use client';

import React, { useState } from 'react';
import { DuffelAncillaries } from '@duffel/components';

export default function WanderAI() {
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [departureDate, setDepartureDate] = useState('2026-07-15');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
const availableServices = seatMaps.length > 0 ? ['bags', 'seats'] : ['bags'];
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [seatMaps, setSeatMaps] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [ancillariesPayload, setAncillariesPayload] = useState<any>(null);

  const [givenName, setGivenName] = useState('James');
  const [familyName, setFamilyName] = useState('Cooper');
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('+447700000000');
  const [bornOn, setBornOn] = useState('1990-01-01');
  const [gender, setGender] = useState<'m' | 'f'>('m');
  const [title, setTitle] = useState<'mr' | 'mrs' | 'ms' | 'miss' | 'dr'>('mr');

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

  const selectOffer = async (offer: any) => {
    setLoading(true);
    setSelectedOffer(offer);
    setAncillariesPayload(null);
    setSeatMaps([]);

    try {
      const res = await fetch(`/api/seat-maps?offer_id=${offer.id}`);
      const data = await res.json();

      if (data.success && data.seat_maps?.length > 0) {
        setSeatMaps(data.seat_maps);
      } else {
        console.log('No seat maps for this offer — showing bags only');
        setSeatMaps([]);
      }

      setShowCheckout(true);
    } catch (err) {
      console.error('Seat maps fetch failed:', err);
      setSeatMaps([]);
      setShowCheckout(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePayloadReady = (data: any, metadata: any) => {
    setAncillariesPayload(data);
  };

  const handlePayNow = async () => {
    if (!selectedOffer || !ancillariesPayload) {
      alert('Please complete bags/seats selection first');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        ...ancillariesPayload,
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
        console.error(result);
        return;
      }

      alert(`✅ Booked successfully! Order ID: ${result.order.id}`);
      setShowCheckout(false);
      setAncillariesPayload(null);
      setSelectedOffer(null);
      setSeatMaps([]);

    } catch (err: any) {
      console.error(err);
      alert('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const passenger = {
    id: 'pax_1',
    given_name: givenName,
    family_name: familyName,
    gender: gender,
    title: title,
    born_on: bornOn,
    email: email,
    phone_number: phone,
  };

  // Only request seats if we have seat maps
  const availableServices = seatMaps.length > 0 ? ['bags', 'seats'] : ['bags'];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wander AI</h1>

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
                  <div key={index} onClick={() => selectOffer(offer)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-2xl p-6 cursor-pointer transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">{airline}</div>
                        <div className="text-sm text-zinc-400 mt-1">{originCode} → {destCode}</div>
                        <div className="text-xs text-zinc-500 mt-1">{segment?.departing_at}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">£{offer.total_amount}</div>
                        <div className="text-xs text-zinc-400">{offer.total_currency}</div>
                        <div className="text-emerald-400 text-sm mt-1">Select →</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showCheckout && selectedOffer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Complete Booking</h2>
                <button onClick={() => setShowCheckout(false)} className="text-zinc-400 text-2xl">×</button>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-5 mb-6">
                <div className="font-semibold">{selectedOffer.owner?.name}</div>
                <div className="text-sm text-zinc-400">
                  {selectedOffer.slices?.[0]?.origin?.iata_code || selectedOffer.slices?.[0]?.origin} → {selectedOffer.slices?.[0]?.destination?.iata_code || selectedOffer.slices?.[0]?.destination}
                </div>
                <div className="text-2xl font-bold mt-2">£{selectedOffer.total_amount}</div>
              </div>

              <div className="mb-8">
                <div className="font-semibold mb-3 text-lg">Bags, seats & extras</div>
                <div className="bg-zinc-800 rounded-2xl p-6">
                  <DuffelAncillaries
                    debug={true}
                    offer={selectedOffer}
                    seat_maps={seatMaps.length > 0 ? seatMaps : undefined}
                    services={availableServices}
                    passengers={[passenger]}
                    onPayloadReady={handlePayloadReady}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input placeholder="First name" value={givenName} onChange={e => setGivenName(e.target.value)} className="bg-zinc-800 p-3 rounded-xl" />
                <input placeholder="Last name" value={familyName} onChange={e => setFamilyName(e.target.value)} className="bg-zinc-800 p-3 rounded-xl" />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-zinc-800 p-3 rounded-xl col-span-2" />
                <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="bg-zinc-800 p-3 rounded-xl col-span-2" />
                <input type="date" value={bornOn} onChange={e => setBornOn(e.target.value)} className="bg-zinc-800 p-3 rounded-xl" />
              </div>

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
          Proper implementation • seat_maps only when available
        </p>
      </div>
    </div>
  );
}
