'use client';

import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';

export default function WanderAI() {
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [departureDate, setDepartureDate] = useState('2026-07-15');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [ancillariesPayload, setAncillariesPayload] = useState<any>(null);

  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bornOn, setBornOn] = useState('');
  const [gender, setGender] = useState<'m' | 'f'>('m');
  const [title, setTitle] = useState<'mr' | 'mrs' | 'ms' | 'miss' | 'dr'>('mr');

  const ancillariesRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  const selectOffer = (offer: any) => {
    setSelectedOffer(offer);
    setShowCheckout(true);
    setAncillariesPayload(null);
  };

  useEffect(() => {
    if (!showCheckout || !selectedOffer || !scriptLoaded) return;

    const element = ancillariesRef.current;
    if (!element) return;

    element.render({
      offer_id: selectedOffer.id,
      services: ["bags", "seats"],
      passengers: [
        {
          id: "pax_1",
          given_name: givenName || "Test",
          family_name: familyName || "User",
          gender: gender.toUpperCase(),
          title: title,
          born_on: bornOn || "1990-01-01",
          email: email || "test@example.com",
          phone_number: phone || "+447700000000",
        },
      ],
    });

    const handlePayload = (event: any) => {
      setAncillariesPayload(event.detail);
    };

    element.addEventListener("onPayloadReady", handlePayload);

    return () => {
      element.removeEventListener("onPayloadReady", handlePayload);
    };
  }, [showCheckout, selectedOffer, scriptLoaded, givenName, familyName, email, phone, bornOn, gender, title]);

  const handlePayNow = async () => {
    if (!selectedOffer || !ancillariesPayload) {
      alert("Please complete bags/seats selection first");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        ...ancillariesPayload.data,
        type: "instant",
        selected_offers: [selectedOffer.id],
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: orderPayload }),
      });

      const result = await res.json();

      if (!result.success) {
        alert("Booking failed: " + (result.error || "Unknown error"));
        return;
      }

      alert(`✅ Booked successfully! Order ID: ${result.order.id}`);
      setShowCheckout(false);
      setAncillariesPayload(null);
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
      <Script
        src="https://assets.duffel.com/components/3.7.25/duffel-ancillaries.js"
        onLoad={() => setScriptLoaded(true)}
      />

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
                        <div className="text-emerald-400 text-sm mt-1">Select flight →</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showCheckout && selectedOffer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-auto p-8">
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
                  {/* @ts-ignore - Duffel web component */}
                  <duffel-ancillaries ref={ancillariesRef}></duffel-ancillaries>
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
                {loading ? 'Processing...' : 'Pay Now & Book with Duffel'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-zinc-500 mt-12">
          Clean build • Duffel Web Component
        </p>
      </div>
    </div>
  );
}
